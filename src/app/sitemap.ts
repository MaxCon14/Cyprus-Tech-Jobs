import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllPosts } from "@/lib/blog";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.careers";

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/jobs`,               lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
{ url: `${BASE}/salary-guide`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/post-a-job`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/faq`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/blog`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
  { url: `${BASE}/jobs/nicosia`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
  { url: `${BASE}/jobs/limassol`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
  { url: `${BASE}/jobs/larnaca`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/jobs/paphos`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  { url: `${BASE}/jobs/remote`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
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

  return [...STATIC, ...jobEntries, ...blogEntries];
}
