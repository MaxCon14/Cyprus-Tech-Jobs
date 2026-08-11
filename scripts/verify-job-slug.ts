/**
 * Checks the company-role-city slug rules and, against a real database, that
 * a renamed job's old URL still resolves.
 *
 *   npx tsx scripts/verify-job-slug.ts            # pure rules only
 *   DATABASE_URL=... npx tsx scripts/verify-job-slug.ts --db   # + redirect path
 */
import { buildJobSlug } from "../src/lib/job-slug";

let failures = 0;

function check(name: string, got: string, want: string) {
  const pass = got === want;
  if (!pass) failures++;
  console.log(`${pass ? "✓" : "✗"} ${name.padEnd(46)} ${got}${pass ? "" : `   WANT ${want}`}`);
}

console.log("— slug shape —");
check("company + role + city",
  buildJobSlug({ companyName: "Exness", title: "Data Analyst", city: "Limassol", remoteType: "ON_SITE" }),
  "exness-data-analyst-limassol");

check("remote with no city gets 'remote'",
  buildJobSlug({ companyName: "Bolt", title: "Backend Engineer", city: null, remoteType: "REMOTE" }),
  "bolt-backend-engineer-remote");

check("hybrid keeps its city",
  buildJobSlug({ companyName: "Bolt", title: "Courier Operations Manager", city: "Nicosia", remoteType: "HYBRID" }),
  "bolt-courier-operations-manager-nicosia");

check("no city and not remote omits the segment",
  buildJobSlug({ companyName: "Acme", title: "Product Owner", city: null, remoteType: "ON_SITE" }),
  "acme-product-owner");

check("punctuation and case are normalised",
  buildJobSlug({ companyName: "Wargaming.net", title: "Game Data Analyst (World of Warships, PC)", city: "Nicosia", remoteType: "ON_SITE" }),
  "wargaming-net-game-data-analyst-world-of-warships-pc-nicosia");

check("ampersands and slashes survive as separators",
  buildJobSlug({ companyName: "A&B Ltd", title: "CI/CD Engineer", city: "Paphos", remoteType: "ON_SITE" }),
  "a-b-ltd-ci-cd-engineer-paphos");

check("missing company still yields a usable slug",
  buildJobSlug({ companyName: "", title: "Data Analyst", city: "Limassol", remoteType: "ON_SITE" }),
  "data-analyst-limassol");

console.log("\n— length —");
const long = buildJobSlug({
  companyName: "Some Quite Long Cyprus Company Name Ltd",
  title:       "Senior Principal Staff Software Engineer for Platform Infrastructure and Reliability",
  city:        "Limassol",
  remoteType:  "ON_SITE",
});
const lengthOk = long.length <= 90 && long.startsWith("some-quite-long-cyprus-company-name-ltd-") && long.endsWith("-limassol");
if (!lengthOk) failures++;
console.log(`${lengthOk ? "✓" : "✗"} ${"long title trimmed, ends intact".padEnd(46)} ${long} (${long.length})`);
const noSevered = !/-$/.test(long) && !long.includes("--");
if (!noSevered) failures++;
console.log(`${noSevered ? "✓" : "✗"} ${"no trailing or doubled hyphen".padEnd(46)} ${noSevered}`);

async function dbChecks() {
  const { prisma } = await import("../src/lib/prisma");
  const { uniqueJobSlug } = await import("../src/lib/job-slug");
  const { getJobSlugRedirect } = await import("../src/lib/queries");

  console.log("\n— uniqueness and redirects (live DB) —");

  const base = "exness-data-analyst-limassol";
  const first = await uniqueJobSlug(base);
  const firstFree = first === base || /-\d+$/.test(first);
  if (!firstFree) failures++;
  console.log(`${firstFree ? "✓" : "✗"} ${"uniqueJobSlug returns base or -N".padEnd(46)} ${first}`);

  // A retired slug must resolve to the job's current URL.
  const historic = await prisma.jobSlugHistory.findFirst({
    select: { slug: true, job: { select: { slug: true } } },
  });
  if (historic) {
    const resolved = await getJobSlugRedirect(historic.slug);
    const ok = resolved === historic.job.slug;
    if (!ok) failures++;
    console.log(`${ok ? "✓" : "✗"} ${"old slug resolves to current".padEnd(46)} ${historic.slug} -> ${resolved}`);

    // And it must not be claimable by a new job.
    const claimed = await uniqueJobSlug(historic.slug);
    const guarded = claimed !== historic.slug;
    if (!guarded) failures++;
    console.log(`${guarded ? "✓" : "✗"} ${"retired slug cannot be reused".padEnd(46)} ${claimed}`);
  } else {
    console.log("  (no history rows yet — run the backfill to exercise redirects)");
  }

  const unknown = await getJobSlugRedirect("definitely-not-a-slug-xyz");
  const unknownOk = unknown === null;
  if (!unknownOk) failures++;
  console.log(`${unknownOk ? "✓" : "✗"} ${"unknown slug resolves to null (404)".padEnd(46)} ${unknown}`);

  await prisma.$disconnect();
}

(async () => {
  if (process.argv.includes("--db")) await dbChecks();
  console.log(failures === 0 ? "\nAll slug checks passed." : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
})();
