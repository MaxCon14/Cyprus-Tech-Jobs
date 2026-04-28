import type { MetadataRoute } from "next";
import { comparisons } from "@/data/comparisons";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.jobs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/salary-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/get-started`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/post-a-job`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/candidates/onboarding`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Comparison pages
  const compareRoutes: MetadataRoute.Sitemap = comparisons.map((c) => ({
    url: `${BASE}/compare/${c.slug}`,
    lastModified: new Date(c.lastReviewed),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Job detail pages
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const jobs = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, postedAt: true },
    });
    jobRoutes = jobs.map((job) => ({
      url: `${BASE}/jobs/${job.slug}`,
      lastModified: job.postedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // Prisma unavailable at build time in some environments — skip job routes
  }

  return [...staticRoutes, ...compareRoutes, ...jobRoutes];
}
