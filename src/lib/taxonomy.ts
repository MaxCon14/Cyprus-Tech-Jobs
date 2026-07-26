/* Shared taxonomy vocabulary.
 *
 * Constants only — no Prisma, no next/cache. The nav is a client component and
 * imports the labels below, so anything here ends up in the client bundle. The
 * database side lives in queries.ts (getNavCategories, findCategoryBySlug). */

/* ── Enum labels ───────────────────────────────────────────────
   One definition per schema enum. These used to be re-declared in each file
   that needed them, and the copies drifted: the nav's Job Type menu listed
   three of the five employment types, so a Freelance or Internship role could
   be posted and then never browsed to. Import from here instead of retyping. */

export const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME:  "Full-time",
  PART_TIME:  "Part-time",
  CONTRACT:   "Contract",
  INTERNSHIP: "Internship",
  FREELANCE:  "Freelance",
};

export const WORK_TYPE_LABELS: Record<string, string> = {
  REMOTE:  "Remote",
  HYBRID:  "Hybrid",
  ON_SITE: "On-site",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  JUNIOR:    "Junior",
  MID:       "Mid-level",
  SENIOR:    "Senior",
  LEAD:      "Lead",
  EXECUTIVE: "Executive",
};

type Option = { label: string; value: string };

/** Turn a label map into <Select> options, with an "any" entry at the top. */
function options(labels: Record<string, string>, anyLabel: string): Option[] {
  return [{ label: anyLabel, value: "" }, ...Object.entries(labels).map(([value, label]) => ({ label, value }))];
}

export const EMPLOYMENT_OPTIONS = options(EMPLOYMENT_LABELS, "Any job type");
export const WORK_TYPE_OPTIONS  = options(WORK_TYPE_LABELS,  "Any work type");
export const EXPERIENCE_OPTIONS = options(EXPERIENCE_LABELS, "Any experience");

/* ── Categories ────────────────────────────────────────────────
   The `categories` table is the only source of truth for the taxonomy. The nav
   and the homepage grid used to hold their own hardcoded lists, which is how
   three top-level categories (Finance & Trading, Full Stack, Management) ended
   up with no way in, and why the same category was labelled differently
   depending on which page you were looking at. */

/** Revalidate this after any category write so the nav picks the change up. */
export const CATEGORY_CACHE_TAG = "categories";

export type NavCategory = {
  slug: string;
  name: string;
  children: { slug: string; name: string }[];
};

/** Shown when a submitted category slug is not in the taxonomy. */
export const UNKNOWN_CATEGORY_MESSAGE = "That category is no longer available. Pick one from the list.";
