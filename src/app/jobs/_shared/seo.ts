import type { Metadata } from "next";
import { getJobCount } from "@/lib/queries";

type JobCountFilter = NonNullable<Parameters<typeof getJobCount>[0]>;

/**
 * Spread into a landing page's `Metadata` to keep it out of the index while it
 * has no live jobs.
 *
 * Every "<something> Jobs in Cyprus" page still renders for a human who lands
 * on it — with a helpful empty state — but an empty listing behind a template
 * is thin content, and Google reads a 200 that says "No jobs found" as a
 * **soft 404**. Search Console flagged exactly that on this site: 129 of 159
 * category pages had no jobs behind them, and the corresponding URLs sat in
 * "Discovered – currently not indexed".
 *
 * `follow: true` is deliberate — the page should stay crawlable so Google keeps
 * discovering the job links on it. This is the same reasoning as the robots.txt
 * fix: to keep a *linked* page out of the index, use noindex, never a block.
 *
 * Self-healing in both directions: the count is read per request (these routes
 * are `force-dynamic`), so a page becomes indexable the moment a matching job
 * goes live, and drops back out when the last one expires. `sitemap.ts` applies
 * the same rule to what it submits, so the two never disagree.
 *
 * Fails **open**: if the count query throws, the page keeps its normal
 * indexable metadata. A transient database error must not be able to noindex a
 * page that is already ranking — deindexing is slow to undo, whereas leaving a
 * briefly-empty page indexed costs almost nothing.
 */
export async function noindexWhenEmpty(filter: JobCountFilter): Promise<Pick<Metadata, "robots">> {
  try {
    const count = await getJobCount(filter);
    return count === 0 ? { robots: { index: false, follow: true } } : {};
  } catch {
    return {};
  }
}
