/**
 * End-to-end check that a newly posted job is findable by every filter the site
 * exposes. Runs the real query layer and the real tag linker against a scratch
 * Postgres — see the header of the npm script for how to start one.
 *
 *   DATABASE_URL=postgresql://… npx tsx scripts/verify-taxonomy.ts
 */
import { prisma } from "../src/lib/prisma";
import { getJobs, getJobCount } from "../src/lib/queries";
import { linkJobTags } from "../src/lib/job-tags";

let failures = 0;

function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "FAIL  "} ${name}${detail ? `  — ${detail}` : ""}`);
}

async function main() {
  // Repeatable from a dirty scratch database. Never point DATABASE_URL at
  // anything real: this empties the tables it touches.
  await prisma.jobTag.deleteMany();
  await prisma.job.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.company.deleteMany();
  await prisma.category.deleteMany();

  // ── Seed a taxonomy shaped like production: parent with a child ──
  const design = await prisma.category.create({ data: { name: "Design", slug: "design" } });
  const uiux   = await prisma.category.create({
    data: { name: "UI/UX Designer", slug: "uiux-designer", parentId: design.id },
  });
  // One tag already exists; the rest must be created by linkJobTags.
  await prisma.tag.create({ data: { name: "Figma", slug: "figma" } });

  const company = await prisma.company.create({ data: { name: "Acme Labs", slug: "acme-labs" } });

  // ── An employer posts a job, filed under the CHILD category ──
  const job = await prisma.job.create({
    data: {
      slug: "ui-designer-acme", title: "UI Designer",
      description: "Design systems work in Nicosia.",
      status: "ACTIVE", postedAt: new Date(),
      companyId: company.id, categoryId: uiux.id,
      remoteType: "ON_SITE", employmentType: "FREELANCE", experienceLevel: "JUNIOR",
      city: "Nicosia", salaryMin: 30000, salaryMax: 45000,
    },
  });

  // Skills: one existing, several absent from `tags`, two that slugify alike,
  // plus a duplicate and a padded entry.
  await linkJobTags(job.id, ["Figma", "Blender", "Unity", "C#", "C++", "Figma", "  Spline  "]);

  const tagged = await prisma.jobTag.findMany({
    where: { jobId: job.id }, include: { tag: true },
  });
  const names = tagged.map(t => t.tag.name).sort();
  check("all 6 distinct skills linked (none silently dropped)",
    names.length === 6, names.join(", "));
  check("duplicate submitted skill linked once", names.filter(n => n === "Figma").length === 1);
  check("padded skill trimmed", names.includes("Spline"));

  const cHash = await prisma.tag.findUnique({ where: { name: "C#" } });
  const cPlus = await prisma.tag.findUnique({ where: { name: "C++" } });
  check("colliding slugs both created (C# / C++)",
    Boolean(cHash && cPlus) && cHash!.slug !== cPlus!.slug,
    `${cHash?.slug} vs ${cPlus?.slug}`);

  // ── A curated job, the kind an admin adds by hand: no Company row ──
  const curated = await prisma.job.create({
    data: {
      slug: "brand-designer-northwind", title: "Brand Designer",
      description: "Visual identity work.",
      status: "ACTIVE", postedAt: new Date(),
      isCurated: true, curatedCompanyName: "Northwind Studio",
      categoryId: design.id,
      remoteType: "REMOTE", employmentType: "CONTRACT", experienceLevel: "SENIOR",
      salaryMin: 50000, salaryMax: 60000,
    },
  });

  // ── Every filter the site can send ──
  const cases: [string, Parameters<typeof getJobs>[0], string][] = [
    ["category = design (parent of the job's category)", { categorySlug: "design" },        job.slug],
    ["category = uiux-designer (exact)",                 { categorySlug: "uiux-designer" }, job.slug],
    ["employment = FREELANCE",                           { employmentType: "FREELANCE" },   job.slug],
    ["work type = ON_SITE",                              { remoteType: "ON_SITE" },         job.slug],
    ["city = Nicosia",                                   { city: "Nicosia" },               job.slug],
    ["level = JUNIOR",                                   { experienceLevel: "JUNIOR" },     job.slug],
    ["skill = Blender (created on save)",                { skill: "Blender" },              job.slug],
    ["skill = c# (case-insensitive)",                    { skill: "c#" },                   job.slug],
    ["salary floor 30000",                               { salary: 30000 },                 job.slug],
    ["search by title",                                  { search: "UI Designer" },         job.slug],
    ["search by company name",                           { search: "Acme" },                job.slug],
    ["search by curated company name",                   { search: "Northwind" },       curated.slug],
    ["curated job under its category",                   { categorySlug: "design" },    curated.slug],
    ["combined: design + FREELANCE + Nicosia",
      { categorySlug: "design", employmentType: "FREELANCE", city: "Nicosia" },             job.slug],
  ];

  for (const [name, filters, expectedSlug] of cases) {
    const rows = await getJobs(filters);
    check(name, rows.some(r => r.slug === expectedSlug));
  }

  // The list and its "N jobs" header must agree, or pagination lies.
  for (const [name, filters] of cases) {
    const [rows, count] = await Promise.all([getJobs(filters), getJobCount(filters)]);
    if (rows.length !== count) check(`count matches list for: ${name}`, false, `${rows.length} vs ${count}`);
  }
  check("getJobCount agrees with getJobs on every filter", true);

  // A filter that should NOT match, so the checks above mean something.
  const wrong = await getJobs({ employmentType: "INTERNSHIP" });
  check("non-matching filter returns nothing", wrong.length === 0);

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });
