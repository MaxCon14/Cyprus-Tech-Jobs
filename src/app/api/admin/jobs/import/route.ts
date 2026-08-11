import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";
import { enforceIpLimit } from "@/lib/rate-limit";
import { htmlToText, extractJson, str, normaliseDraft, type ImportDraft } from "@/lib/job-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Fetch plus one model call; the Hobby 10s cap would cut this off.
export const maxDuration = 60;

const FETCH_TIMEOUT_MS = 20_000;
const MAX_HTML_CHARS   = 120_000;

/**
 * Prefill the admin "add curated job" form from a live job posting URL.
 *
 * This is a deliberate exception to the rule set in `src/lib/cv-url.ts`, which
 * closed an SSRF by pinning fetches to our own storage. Here the whole point is
 * to read someone else's careers page, so no allowlist is possible. What makes
 * it acceptable is that it is **admin-only** — gated on getAdminUser() before
 * anything is fetched — and rate limited. It must never become reachable
 * without that gate, and it must never be called from the public site.
 *
 * It writes nothing. The response is a draft the admin reviews and submits
 * through the normal POST /api/admin/jobs route, which does its own validation.
 *
 * On descriptions: the model is asked to WRITE AN ORIGINAL description from the
 * facts, not to reproduce the source text. Republishing an employer's wording
 * verbatim is someone else's copyright, and duplicate text also ranks worse
 * than original writing. This automates the rewrite that was being done by hand.
 */
const IMPORT_LIMIT = { name: "admin-job-import", limit: 60, windowSeconds: 3600 };

/* Browser-like, because a bare fetch UA is refused outright by a lot of ATS
   front doors. Unlike the apply-link checker this does not append an honest
   identifying token: that checker's refusals are just data quality, whereas a
   refusal here blocks the admin from doing their job. */
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36";

export async function POST(req: NextRequest) {
  if (!await getAdminUser()) return adminUnauthorized();

  const limited = await enforceIpLimit(req, IMPORT_LIMIT, "Too many imports in the last hour.");
  if (limited) return limited;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
  }

  let sourceUrl = "";
  try {
    const body = await req.json();
    sourceUrl = str(body.url);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!sourceUrl) return NextResponse.json({ error: "A job posting URL is required." }, { status: 422 });

  let target: URL;
  try {
    target = new URL(/^https?:\/\//i.test(sourceUrl) ? sourceUrl : `https://${sourceUrl}`);
  } catch {
    return NextResponse.json({ error: "That does not look like a valid URL." }, { status: 422 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ error: "Only http and https URLs can be imported." }, { status: 422 });
  }

  let html: string;
  try {
    const res = await fetch(target.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": BROWSER_UA, "Accept": "text/html,*/*", "Accept-Language": "en-GB,en;q=0.9" },
    });
    if (!res.ok) {
      // Some careers sites answer automated requests with a 404 even when the
      // page is live — the same stealth block the apply-link checker hits.
      return NextResponse.json(
        { error: `The page returned HTTP ${res.status}. Some careers sites block automated requests — paste the details manually.` },
        { status: 422 },
      );
    }
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "Could not load that page. Check the URL, or paste the details manually." }, { status: 422 });
  }

  const text = htmlToText(html).slice(0, MAX_HTML_CHARS);
  if (text.length < 200) {
    return NextResponse.json(
      { error: "That page had almost no readable text — it is probably rendered by JavaScript. Paste the details manually." },
      { status: 422 },
    );
  }

  // Offer the real taxonomy so the model picks an existing slug rather than
  // inventing one. The admin route 422s on an unknown category anyway; this
  // just makes the common case land correctly.
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true, parent: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  const categoryList = categories
    .map(c => `${c.slug} = ${c.parent ? `${c.parent.name} > ` : ""}${c.name}`)
    .join("\n");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let draft: ImportDraft;
  try {
    const message = await anthropic.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system:
        "You extract structured data from job postings for a Cyprus tech job board. " +
        "Return ONLY a JSON object, no prose and no code fences.",
      messages: [{
        role: "user",
        content:
`Read this job posting and return JSON with exactly these keys:

title            - the role title, cleaned of company name and location
companyName      - the hiring company
city             - one of Limassol, Nicosia, Larnaca, Paphos, Famagusta, or null if not stated
remoteType       - REMOTE, HYBRID or ON_SITE
employmentType   - FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP or FREELANCE
experienceLevel  - JUNIOR, MID, SENIOR, LEAD or EXECUTIVE
salaryMin        - annual gross figure as a number, ONLY if the posting states a salary. Otherwise null.
salaryMax        - same rule. Otherwise null.
categorySlug     - the single best match from the list below, or null
tags             - up to 10 concrete technologies or skills named in the posting
notes            - anything a human should double-check, or null
descriptionHtml  - see below

CRITICAL RULES
- NEVER invent or estimate a salary. If the posting does not state one, both
  salary fields must be null. A guessed number misleads job seekers.
- descriptionHtml must be YOUR OWN ORIGINAL WRITING summarising the role, not
  the posting's text reworded slightly and not copied. Aim for 200-350 words
  covering what the role does, key responsibilities and requirements. Use only
  <p>, <ul>, <li>, <strong> and <h3> tags. Do not invent requirements or perks
  that are not in the source.
- If a field is genuinely not stated, use null rather than guessing.

CATEGORIES (slug = path):
${categoryList}

JOB POSTING:
${text}`,
      }],
    });

    const raw = message.content.find(b => b.type === "text");
    if (!raw || raw.type !== "text") throw new Error("Empty model response.");
    const parsed = extractJson(raw.text) as Record<string, unknown>;
    draft = normaliseDraft(parsed, categories);
  } catch (err) {
    console.error("[jobs/import]", err);
    return NextResponse.json({ error: "Could not read that posting. Paste the details manually." }, { status: 422 });
  }

  if (!draft.title || !draft.companyName) {
    return NextResponse.json(
      { error: "Could not find a job title and company on that page. Paste the details manually." },
      { status: 422 },
    );
  }


  return NextResponse.json({ draft: { ...draft, applyUrl: target.toString() } });
}
