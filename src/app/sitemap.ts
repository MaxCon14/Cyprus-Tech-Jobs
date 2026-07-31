import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllPosts } from "@/lib/blog";
import { getCompanySlugs } from "@/lib/queries";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.careers";

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/jobs`,               lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
{ url: `${BASE}/salary-guide`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/post-a-job`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/faq`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/blog`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
  { url: `${BASE}/companies`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/jobs/nicosia`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
  { url: `${BASE}/jobs/limassol`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
  { url: `${BASE}/jobs/larnaca`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/jobs/paphos`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/jobs/remote`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
  { url: `${BASE}/jobs/type/full-time`,  lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  { url: `${BASE}/jobs/type/part-time`,  lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  { url: `${BASE}/jobs/type/contract`,   lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  { url: `${BASE}/jobs/type/internship`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  { url: `${BASE}/jobs/type/freelance`,  lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  { url: `${BASE}/privacy`,            lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  { url: `${BASE}/terms`,              lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  { url: `${BASE}/cookies`,            lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
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

  /* ── Category landing pages (parents + roles) ── */
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    categoryEntries = categories.map(c => ({
      url:             `${BASE}/jobs/category/${c.slug}`,
      lastModified:    new Date(),
      changeFrequency: "daily" as const,
      priority:        0.7,
    }));
  } catch (err) {
    console.error("[sitemap] categories query failed:", err);
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

  return [...STATIC, ...categoryEntries, ...jobEntries, ...companyEntries, ...roleCityEntries, ...blogEntries];
}
