import type { Metadata } from "next";
import type { CityConfig, CitySearchParams } from "./CityPage";

export function normaliseCityParams(raw: CitySearchParams): CitySearchParams {
  const result: CitySearchParams = {};
  for (const key of ["category", "skill", "search"] as const) {
    if (typeof raw[key] === "string" && raw[key].trim()) result[key] = raw[key].trim();
  }
  for (const [key, values] of [
    ["type", ["REMOTE", "HYBRID", "ON_SITE"]],
    ["employment", ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]],
    ["level", ["JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"]],
  ] as const) {
    const value = raw[key];
    if (typeof value === "string" && (values as readonly string[]).includes(value)) result[key] = value;
  }
  if (typeof raw.salary === "string" && /^\d+$/.test(raw.salary) && Number(raw.salary) > 0 && Number(raw.salary) <= 10000000) result.salary = raw.salary;
  if (typeof raw.page === "string" && /^\d+$/.test(raw.page) && Number.isSafeInteger(Number(raw.page)) && Number(raw.page) > 1) result.page = String(Number(raw.page));
  return result;
}

export function cityMetadata(config: CityConfig, raw: CitySearchParams): Metadata {
  const params = normaliseCityParams(raw);
  const page = Number(params.page ?? 1);
  const filtered = Object.keys(raw).some(key => key !== "page");
  const title = `Tech & IT Jobs in ${config.displayName}, Cyprus${page > 1 ? ` — Page ${page}` : ""}`;
  const url = `https://cyprustech.careers/jobs/${config.slug}${!filtered && page > 1 ? `?page=${page}` : ""}`;
  return {
    title, description: config.description,
    alternates: { canonical: url },
    robots: { index: !filtered, follow: true },
    openGraph: { title, description: config.description, url, type: "website", siteName: "CyprusTech.Careers", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: config.description, images: ["/og-image.png"] },
  };
}
