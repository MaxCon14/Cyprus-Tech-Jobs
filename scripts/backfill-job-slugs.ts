/**
 * Rename existing jobs to the company-role-city slug scheme, recording every
 * old slug in JobSlugHistory so the URLs already indexed keep working.
 *
 * Safe to re-run: a job already on its target slug is skipped, and the history
 * row is only written for a slug that actually changes.
 *
 *   npx tsx scripts/backfill-job-slugs.ts          # dry run, prints the plan
 *   npx tsx scripts/backfill-job-slugs.ts --apply  # writes
 *
 * Needs DATABASE_URL. Run the dry run first and read the list — a rename is
 * cheap to do and awkward to undo once Google has seen the redirect.
 */
import { prisma } from "../src/lib/prisma";
import { buildJobSlug } from "../src/lib/job-slug";

const APPLY = process.argv.includes("--apply");

async function main() {
  const jobs = await prisma.job.findMany({
    select: {
      id: true, slug: true, title: true, city: true, remoteType: true,
      curatedCompanyName: true,
      company: { select: { name: true } },
    },
    orderBy: { postedAt: "asc" },
  });

  /* Taken-set built up front and mutated as we go, so two jobs that map to the
     same base slug in this run get -2 rather than colliding on write. Seeded
     with history too: a retired slug still serves a redirect, and handing it
     to a different job would point an old URL at the wrong listing. */
  const taken = new Set<string>(jobs.map(j => j.slug));
  for (const h of await prisma.jobSlugHistory.findMany({ select: { slug: true } })) {
    taken.add(h.slug);
  }

  const plan: { id: string; from: string; to: string }[] = [];

  for (const job of jobs) {
    const base = buildJobSlug({
      companyName: job.curatedCompanyName ?? job.company?.name ?? "",
      title:       job.title,
      city:        job.city,
      remoteType:  job.remoteType,
    });

    if (base === job.slug) continue;

    // The job's own current slug must not block its own rename.
    taken.delete(job.slug);
    let candidate = base;
    let n = 2;
    while (taken.has(candidate)) candidate = `${base}-${n++}`;
    taken.add(candidate);

    plan.push({ id: job.id, from: job.slug, to: candidate });
  }

  if (plan.length === 0) {
    console.log("Nothing to rename — every job already matches the scheme.");
    return;
  }

  const width = Math.max(...plan.map(p => p.from.length));
  for (const p of plan) console.log(`  ${p.from.padEnd(width)}  ->  ${p.to}`);
  console.log(`\n${plan.length} job${plan.length === 1 ? "" : "s"} to rename.`);

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to write these changes.");
    return;
  }

  for (const p of plan) {
    /* One transaction per job: the history row and the rename have to land
       together, or an old URL 404s in the window between them. */
    await prisma.$transaction([
      prisma.jobSlugHistory.create({ data: { slug: p.from, jobId: p.id } }),
      prisma.job.update({ where: { id: p.id }, data: { slug: p.to } }),
    ]);
    console.log(`renamed ${p.from} -> ${p.to}`);
  }

  console.log(`\nDone. ${plan.length} renamed, ${plan.length} redirect${plan.length === 1 ? "" : "s"} recorded.`);
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
