import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getJobBySlug } from "@/lib/queries";

export const runtime = "nodejs";

const MAX_BYTES        = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;

interface ReviewStrength {
  title:  string;
  detail: string;
}

interface ReviewImprovement {
  title:  string;
  detail: string;
  tip:    string;
}

interface ReviewResult {
  score:         number;
  headline:      string;
  strengths:     ReviewStrength[];
  improvements:  ReviewImprovement[];
  encouragement: string;
}

// ── JSON extraction ────────────────────────────────────────────────────────────

function extractJson(raw: string): unknown {
  // Strategy 1: direct parse
  try { return JSON.parse(raw); } catch { /* continue */ }

  // Strategy 2: strip code fences (```json…``` or ```…```)
  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try { return JSON.parse(stripped); } catch { /* continue */ }

  // Strategy 3: extract first balanced {…} block from anywhere in text
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* continue */ }
  }

  throw new Error("Could not extract valid JSON from the AI response.");
}

// ── Response normalisation ────────────────────────────────────────────────────

const DEFAULT_TIP =
  "Review this section of your CV and add specific examples, measurable achievements, or relevant technologies. Concrete, quantified details are far more compelling to hiring managers than general statements.";

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function normalizeResult(raw: unknown): ReviewResult {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;

  const score = typeof obj.score === "number"
    ? Math.max(0, Math.min(100, Math.round(obj.score)))
    : 50;

  const strengths: ReviewStrength[] = (Array.isArray(obj.strengths) ? obj.strengths : [])
    .map((s: unknown) => {
      const item = (typeof s === "object" && s !== null ? s : {}) as Record<string, unknown>;
      return {
        title:  str(item.title,  "Strength identified"),
        detail: str(item.detail, "The AI found a positive match here."),
      };
    })
    .filter(s => s.title && s.detail)
    .slice(0, 5);

  const improvements: ReviewImprovement[] = (Array.isArray(obj.improvements) ? obj.improvements : [])
    .map((imp: unknown) => {
      const item = (typeof imp === "object" && imp !== null ? imp : {}) as Record<string, unknown>;
      return {
        title:  str(item.title,  "Area to strengthen"),
        detail: str(item.detail, "Consider reviewing this area of your CV."),
        tip:    str(item.tip,    DEFAULT_TIP),
      };
    })
    .filter(i => i.title)
    .slice(0, 5);

  return {
    score,
    headline:      str(obj.headline,      "Analysis complete — see details below."),
    strengths,
    improvements,
    encouragement: str(obj.encouragement, "Keep refining your application — you've got this!"),
  };
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

async function buildPrompt(jobSlug: string) {
  const job = await getJobBySlug(jobSlug);
  if (!job) return null;

  const skills = job.tags.map((t) => t.tag.name).join(", ") || "not specified";

  const prompt = `You are a warm, expert career coach reviewing a candidate's CV against a specific job posting.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company?.name ?? job.curatedCompanyName ?? ""}
- Experience level: ${job.experienceLevel}
- Required skills/tech: ${skills}
- Job description:
${job.description}

THE CANDIDATE'S CV IS ATTACHED AS A PDF DOCUMENT.

Carefully read the entire CV and assess how well this candidate matches the job above.

Respond ONLY with a valid JSON object in this exact shape — no markdown, no code fences, no commentary before or after, just raw JSON starting with { and ending with }:
{
  "score": <integer 0-100 representing overall match percentage>,
  "headline": "<one upbeat sentence summarising the match, e.g. 'Strong match — a couple of quick additions will seal the deal'>",
  "strengths": [
    { "title": "<short strength title, 3-6 words>", "detail": "<2-3 sentences with specific evidence from both the CV and the job ad — be concrete, name actual skills, projects, or experience>"},
    { "title": "...", "detail": "..." },
    { "title": "...", "detail": "..." }
  ],
  "improvements": [
    {
      "title": "<short gap title, 3-6 words>",
      "detail": "<2-3 sentences explaining why this gap matters for this specific role and what the employer is looking for>",
      "tip": "<REQUIRED: specific, actionable advice of at least 2 full sentences — exactly what to add, rewrite, or highlight in the CV to close this gap. Be concrete and practical. This field must never be empty.>"
    },
    { "title": "...", "detail": "...", "tip": "..." },
    { "title": "...", "detail": "...", "tip": "..." }
  ],
  "encouragement": "<one warm, genuine closing sentence that encourages the candidate to apply>"
}

CRITICAL RULES — violating these will break the application:
- Output ONLY the raw JSON object. No text before it, no text after it, no code fences, no backticks.
- The "tip" field in every improvement MUST contain a specific, actionable recommendation of at least 2 sentences. It must NEVER be empty, null, or a placeholder.
- Score honestly: 80-100 strong match, 60-79 good match with minor gaps, 40-59 partial match, below 40 weak match. Don't round everything to 80.
- Strengths: celebrate real matches — reference actual skills, job titles, or projects visible in the CV.
- Improvements: frame every gap as a quick win ("Adding X would show…" not "You lack X").
- Tips: be genuinely specific — "Add a bullet point about your experience with X in your Y role" beats "mention more skills".`;

  return { job, prompt };
}

// ── Analysis runner ────────────────────────────────────────────────────────────

async function runAnalysis(base64: string, prompt: string): Promise<ReviewResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf" as const, data: base64 } },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const raw    = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  const parsed = extractJson(raw);
  return normalizeResult(parsed);
}

// ── File upload handler ────────────────────────────────────────────────────────

async function handleFileUpload(req: NextRequest): Promise<ReviewResult | NextResponse> {
  const formData = await req.formData();
  const jobSlug  = formData.get("jobSlug");
  const file     = formData.get("file");

  if (typeof jobSlug !== "string" || !jobSlug) {
    return NextResponse.json({ error: "Job slug is required." }, { status: 422 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Maximum size is 5 MB." }, { status: 422 });
  }

  const built = await buildPrompt(jobSlug);
  if (!built) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  return runAnalysis(base64, built.prompt);
}

// ── CV URL handler ─────────────────────────────────────────────────────────────

async function handleCvUrl(jobSlug: string, cvUrl: string): Promise<ReviewResult | NextResponse> {
  const built = await buildPrompt(jobSlug);
  if (!built) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  const url = cvUrl.startsWith("http") ? cvUrl : `https://${cvUrl}`;

  let cvRes: Response;
  try {
    cvRes = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch {
    return NextResponse.json(
      { error: "Could not fetch your saved CV. Please upload it manually." },
      { status: 422 }
    );
  }

  if (!cvRes.ok) {
    return NextResponse.json(
      { error: "Could not fetch your saved CV. Please upload it manually." },
      { status: 422 }
    );
  }

  const buffer = await cvRes.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Saved CV is too large (max 5 MB)." }, { status: 422 });
  }

  const base64 = Buffer.from(buffer).toString("base64");
  return runAnalysis(base64, built.prompt);
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let result: ReviewResult | NextResponse;

    if (contentType.includes("application/json")) {
      const body    = await req.json();
      const jobSlug = typeof body.jobSlug === "string" ? body.jobSlug : "";
      const cvUrl   = typeof body.cvUrl   === "string" ? body.cvUrl   : "";

      if (!jobSlug || !cvUrl) {
        return NextResponse.json({ error: "jobSlug and cvUrl are required." }, { status: 422 });
      }

      result = await handleCvUrl(jobSlug, cvUrl);
    } else {
      result = await handleFileUpload(req);
    }

    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed.";
    console.error("[cv-review]", err);

    if (msg.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
