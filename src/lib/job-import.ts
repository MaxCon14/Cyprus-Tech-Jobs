import { sanitizeJobHtml } from "@/lib/sanitize";
import { EMPLOYMENT_LABELS, WORK_TYPE_LABELS, EXPERIENCE_LABELS } from "@/lib/taxonomy";

/**
 * Parsing and normalisation for the admin "import from a job posting URL"
 * flow. Kept out of the route so the guards below can be tested directly —
 * the same split as link-check.ts and cv-url.ts.
 *
 * Everything here treats the model's output as untrusted input. It is a draft
 * for an admin to review, never something written straight to the database.
 */

/** Strip everything that is not visible prose before spending tokens on it. */
export function htmlToText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|section|article|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractJson(raw: string): unknown {
  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try { return JSON.parse(stripped); } catch { /* fall through */ }
  const obj = raw.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch { /* fall through */ } }
  throw new Error("Model did not return usable JSON.");
}

export function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Only accept an enum value the rest of the app already understands. */
export function oneOf(v: unknown, allowed: Record<string, string>, fallback: string): string {
  const s = str(v).toUpperCase().replace(/[\s-]/g, "_");
  return s in allowed ? s : fallback;
}

/* Everything stored is rendered as an ANNUAL figure — `unitText: "YEAR"` is
   hardcoded in schema.ts — so a monthly salary read off a posting would show
   up as an absurd yearly one. The floor is set above any plausible monthly
   figure rather than at zero for that reason.

   It does mean a genuinely tiny annual figure (a low-paid internship, say) is
   dropped. That is the intended direction: the admin reviews every draft and
   can type the real number, whereas a wrong salary published on someone else's
   job is exactly the misinformation this flow is meant to avoid. */
const MIN_PLAUSIBLE_ANNUAL = 10_000;
const MAX_PLAUSIBLE_ANNUAL = 1_000_000;

/**
 * Salary is only ever taken from a figure the source actually published —
 * never estimated. Anything that does not look like a plausible annual figure
 * is discarded rather than rounded into shape.
 */
export function money(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(str(v).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < MIN_PLAUSIBLE_ANNUAL || n > MAX_PLAUSIBLE_ANNUAL) return null;
  return Math.round(n);
}

export interface ImportDraft {
  title: string;
  companyName: string;
  city: string | null;
  remoteType: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  descriptionHtml: string;
  categorySlug: string | null;
  /** The admin form works in category ids, so resolve it here rather than
   *  making the client map a slug it does not have. */
  categoryId: string | null;
  tags: string[];
  notes: string | null;
}

/** Coerce a raw model object into something the admin form can accept. */
export function normaliseDraft(
  parsed: Record<string, unknown>,
  categories: { id: string; slug: string }[],
): ImportDraft {
  const slug  = str(parsed.categorySlug);
  const known = categories.find(c => c.slug === slug);

  let salaryMin = money(parsed.salaryMin);
  let salaryMax = money(parsed.salaryMax);
  // A range that arrived back to front is a model slip, not employer intent.
  if (salaryMin && salaryMax && salaryMin > salaryMax) {
    [salaryMin, salaryMax] = [salaryMax, salaryMin];
  }

  return {
    title:           str(parsed.title),
    companyName:     str(parsed.companyName),
    city:            str(parsed.city) || null,
    remoteType:      oneOf(parsed.remoteType,      WORK_TYPE_LABELS,  "ON_SITE"),
    employmentType:  oneOf(parsed.employmentType,  EMPLOYMENT_LABELS, "FULL_TIME"),
    experienceLevel: oneOf(parsed.experienceLevel, EXPERIENCE_LABELS, "MID"),
    salaryMin,
    salaryMax,
    // Sanitised on the way in as well as at render — model output is untrusted
    // like any other input, and this is the same allowlist job descriptions
    // already go through.
    descriptionHtml: sanitizeJobHtml(str(parsed.descriptionHtml)),
    categorySlug:    known ? known.slug : null,
    categoryId:      known ? known.id   : null,
    tags:            Array.isArray(parsed.tags) ? parsed.tags.map(str).filter(Boolean).slice(0, 10) : [],
    notes:           str(parsed.notes) || null,
  };
}
