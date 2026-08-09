import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllPosts } from "@/lib/blog";
import { getCompanySlugs, getJobCount } from "@/lib/queries";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.careers";

/* Without this the sitemap is prerendered once at build and then frozen until
   the next deploy — every query below runs during `next build`. That was
   tolerable when the contents were a fixed list, but now that entries appear
   and disappear with live job counts, a build-time snapshot would drift out of
   step with the pages' own noindex state within hours. Hourly, same as
   /llms.txt; a sitemap does not need to be fresher than that. */
export const revalidate = 3600;

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/jobs`,               lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
{ url: `${BASE}/salary-guide`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/post-a-job`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/faq`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/blog`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
  { url: `${BASE}/companies`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/privacy`,            lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  { url: `${BASE}/terms`,              lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  { url: `${BASE}/cookies`,            lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
];

/* City and job-type landing pages used to sit in STATIC above, submitted
   whether or not they had anything on them. They are conditional now for the
   same reason as the role×city block below — an empty "<X> Jobs in Cyprus"
   page is thin content, and Google reads the 200 as a soft 404. Each route's
   generateMetadata applies noindex from the same count, so what is submitted
   here and what is indexable never disagree. */
const CITY_PAGES = [
  { slug: "nicosia",  filter: { city: "Nicosia"  }, priority: 0.8 },
  { slug: "limassol", filter: { city: "Limassol" }, priority: 0.8 },
  { slug: "larnaca",  filter: { city: "Larnaca"  }, priority: 0.7 },
  { slug: "paphos",   filter: { city: "Paphos"   }, priority: 0.7 },
  { slug: "remote",   filter: { remoteType: "REMOTE" }, priority: 0.8 },
];

const TYPE_PAGES = [
  { slug: "full-time",  filter: { employmentType: "FULL_TIME"  }, priority: 0.7 },
  { slug: "part-time",  filter: { employmentType: "PART_TIME"  }, priority: 0.6 },
  { slug: "contract",   filter: { employmentType: "CONTRACT"   }, priority: 0.6 },
  { slug: "internship", filter: { employmentType: "INTERNSHIP" }, priority: 0.6 },
  { slug: "freelance",  filter: { employmentType: "FREELANCE"  }, priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* ── Active job listings ── */
  let jobEntries: MetadataRoute.Sitemap = [];
  try {
    const jobs = await prisma.job.findMany({
      where:  { status: "ACTIVE" },
      select: { slug: true, postedAt: true, updatedAt: true },
      orderBy: { postedAt: "desc" },
    });
    jobEntries = jobs.map(j => ({
      url:             `${BASE}/jobs/${j.slug}`,
      lastModified:    j.updatedAt ?? j.postedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));
  } catch (err) {
    console.error("[sitemap] jobs query failed:", err);
  }

  /* ── Category landing pages (parents + roles) ──
     Only categories with a live job behind them. Submitting all of them is
     what produced 129 empty pages in Search Console's "Discovered – currently
     not indexed" and "Soft 404" buckets. The OR mirrors getJobCount's category
     matching, so a parent stays listed while any of its children has a job —
     which is exactly what its page shows. */
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { jobs:     { some: { status: "ACTIVE" } } },
          { children: { some: { jobs: { some: { status: "ACTIVE" } } } } },
        ],
      },
      select: { slug: true },
    });
    categoryEntries = categories.map(c => ({
      url:             `${BASE}/jobs/category/${c.slug}`,
      lastModified:    new Date(),
      changeFrequency: "daily" as const,
      priority:        0.7,
    }));
  } catch (err) {
    console.error("[sitemap] categories query failed:", err);
  }

  /* ── City & job-type landing pages (only the non-empty ones) ── */
  let landingEntries: MetadataRoute.Sitemap = [];
  try {
    const pages = [
      ...CITY_PAGES.map(p => ({ ...p, path: `jobs/${p.slug}` })),
      ...TYPE_PAGES.map(p => ({ ...p, path: `jobs/type/${p.slug}` })),
    ];
    const counts = await Promise.all(pages.map(p => getJobCount(p.filter)));
    landingEntries = pages
      .filter((_, i) => counts[i] > 0)
      .map(p => ({
        url:             `${BASE}/${p.path}`,
        lastModified:    new Date(),
        changeFrequency: "daily" as const,
        priority:        p.priority,
      }));
  } catch (err) {
    console.error("[sitemap] city/type counts failed:", err);
  }

  /* ── Blog posts ── */
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPosts();
    blogEntries = posts.map(p => ({
      url:             `${BASE}/blog/${p.slug}`,
      lastModified:    new Date(p.publishedAt),
      changeFrequency: "monthly" as const,
      priority:        0.6,
    }));
  } catch (err) {
    console.error("[sitemap] blog query failed:", err);
  }

  /* ── Company profiles ── */
  let companyEntries: MetadataRoute.Sitemap = [];
  try {
    const companies = await getCompanySlugs();
    companyEntries = companies.map(c => ({
      url:             `${BASE}/companies/${c.slug}`,
      lastModified:    c.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority:        0.6,
    }));
  } catch (err) {
    console.error("[sitemap] companies query failed:", err);
  }

  /* ── Role × city landing pages ──
     Only the combinations that actually have a live job are submitted —
     publishing empty "X jobs in Y" pages to Google is thin content and hurts.
     A job contributes to its own category slug AND its parent's, crossed with
     its city (Limassol/Nicosia/Larnaca/Paphos) and, when remote, "remote". */
  let roleCityEntries: MetadataRoute.Sitemap = [];
  try {
    const jobs = await prisma.job.findMany({
      where:  { status: "ACTIVE" },
      select: {
        city:       true,
        remoteType: true,
        category:   { select: { slug: true, parent: { select: { slug: true } } } },
      },
    });
    const CITY_SLUGS = ["limassol", "nicosia", "larnaca", "paphos"];
    const combos = new Set<string>();
    for (const j of jobs) {
      const catSlugs  = [j.category?.slug, j.category?.parent?.slug].filter(Boolean) as string[];
      const citySlugs: string[] = [];
      const cityLower = j.city?.toLowerCase() ?? "";
      for (const cs of CITY_SLUGS) if (cityLower.includes(cs)) citySlugs.push(cs);
      if (j.remoteType === "REMOTE") citySlugs.push("remote");
      for (const cat of catSlugs) for (const city of citySlugs) combos.add(`${cat}/${city}`);
    }
    roleCityEntries = [...combos].map(c => ({
      url:             `${BASE}/jobs/category/${c}`,
      lastModified:    new Date(),
      changeFrequency: "daily" as const,
      priority:        0.7,
    }));
  } catch (err) {
    console.error("[sitemap] role×city query failed:", err);
  }

  return [...STATIC, ...landingEntries, ...categoryEntries, ...jobEntries, ...companyEntries, ...roleCityEntries, ...blogEntries];
}
