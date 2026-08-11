import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

/* Job URLs are company-position-location: /jobs/exness-data-analyst-limassol.
   They used to be title plus a base-36 timestamp (…-msdjd3yn) or title plus
   company, which told a searcher nothing and matched no query anyone types.
   "<company> <role> jobs <city>" is exactly what people search for, so the
   URL should read that way.

   A slug is assigned once, at creation, and deliberately does NOT follow later
   edits to the title, city or company. A URL that changes under an indexed
   page costs more in lost ranking than a slightly stale slug ever gains. */

/** How long the assembled slug may get before the title is trimmed back.
 *  Nothing breaks past this — it just stops a 20-word title producing a URL
 *  no one can read or paste. */
const MAX_SLUG_LENGTH = 90;

export interface JobSlugParts {
  companyName: string | null | undefined;
  title:       string;
  city:        string | null | undefined;
  remoteType:  string | null | undefined;
}

/**
 * Build the readable part of a job URL. Not guaranteed unique on its own —
 * pass the result through `uniqueJobSlug` before writing it.
 */
export function buildJobSlug({ companyName, title, city, remoteType }: JobSlugParts): string {
  const company  = slugify(companyName?.trim() ?? "");
  const role     = slugify(title.trim());
  /* Remote roles have no city but "remote" is a term people search, so it
     earns its place in the URL. A job with neither just omits the segment
     rather than carrying a filler word. */
  const location = city?.trim()
    ? slugify(city.trim())
    : remoteType === "REMOTE" ? "remote" : "";

  const parts = [company, role, location].filter(Boolean);
  const slug  = parts.join("-");
  if (slug.length <= MAX_SLUG_LENGTH) return slug || role || "job";

  /* Over budget: trim the role, which is the long part, and keep company and
     location whole — they are the bits that make the URL identifiable. Cut on
     a hyphen so the result is not a severed word. */
  const budget  = MAX_SLUG_LENGTH - [company, location].filter(Boolean).join("-").length - 1;
  const trimmed = role.slice(0, Math.max(budget, 20)).replace(/-[^-]*$/, "");
  return [company, trimmed, location].filter(Boolean).join("-");
}

/**
 * Make `base` unique across both live job slugs and retired ones.
 *
 * Retired slugs matter: `JobSlugHistory` still serves 301s for them, so
 * handing an old URL to a different job would silently redirect people to the
 * wrong listing. Checking both tables is what keeps that from happening.
 *
 * Collisions get a plain counter — exness-data-analyst-limassol-2 — because a
 * second identical role at the same company in the same city is a real thing
 * an employer does, and a readable number beats a random suffix.
 */
export async function uniqueJobSlug(base: string, excludeJobId?: string): Promise<string> {
  const taken = async (slug: string) => {
    const [job, historic] = await Promise.all([
      prisma.job.findUnique({ where: { slug }, select: { id: true } }),
      prisma.jobSlugHistory.findUnique({ where: { slug }, select: { jobId: true } }),
    ]);
    if (job && job.id !== excludeJobId) return true;
    if (historic && historic.jobId !== excludeJobId) return true;
    return false;
  };

  if (!await taken(base)) return base;

  for (let n = 2; n <= 50; n++) {
    const candidate = `${base}-${n}`;
    if (!await taken(candidate)) return candidate;
  }

  /* Fifty identical postings is not a real scenario, but the loop must
     terminate with something usable rather than throwing on job creation. */
  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

/** Convenience: build and uniquify in one step. */
export async function createJobSlug(parts: JobSlugParts): Promise<string> {
  return uniqueJobSlug(buildJobSlug(parts));
}
