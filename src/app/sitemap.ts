import type { MetadataRoute } from "next";
import { COMPANIES, JOBS } from "@/lib/placeholder-data";

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.jobs";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/jobs`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/companies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/salary-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/post-a-job`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...JOBS.map((job) => ({
      url: `${base}/jobs/${job.slug}`,
      lastModified: job.postedAt ? new Date(job.postedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...COMPANIES.map((company) => ({
      url: `${base}/companies/${company.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
