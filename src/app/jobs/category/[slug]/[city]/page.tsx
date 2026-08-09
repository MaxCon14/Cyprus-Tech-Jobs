import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoryCityPage, ROLE_CITIES, type FixedCity } from "../../../_shared/CategoryCityPage";
import { noindexWhenEmpty } from "../../../_shared/seo";

export const dynamic = "force-dynamic";

const BASE = "https://cyprustech.careers";

const CITY_BY_SLUG: Record<string, FixedCity> = Object.fromEntries(
  ROLE_CITIES.map(c => [c.slug, c]),
);

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where:   { slug },
    include: {
      parent:   { select: { name: true, slug: true } },
      children: { select: { name: true, slug: true }, orderBy: { name: "asc" } },
    },
  });
}

function comboFilter(categorySlug: string, city: FixedCity) {
  return {
    categorySlug,
    ...(city.isRemote ? { remoteType: "REMOTE" } : { city: city.name }),
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; city: string }> },
): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const city = CITY_BY_SLUG[citySlug];
  if (!city) return { title: "Not found" };
  const cat = await getCategory(slug).catch(() => null);
  if (!cat) return { title: "Not found" };

  const heading = city.isRemote ? `Remote ${cat.name} Jobs in Cyprus` : `${cat.name} Jobs in ${city.name}`;
  const where   = city.isRemote ? "remote across Cyprus" : `in ${city.name}, Cyprus`;
  const description = `Find ${cat.name} jobs ${where} — every listing with a verified salary, updated daily. Browse open ${cat.name.toLowerCase()} roles and apply directly on CyprusTech.Careers.`;
  const url     = `${BASE}/jobs/category/${slug}/${citySlug}`;

  return {
    // The root layout's `%s | CyprusTech.Careers` template adds the brand, so
    // the title must not include it here (that would double it).
    title: heading,
    description,
    alternates: { canonical: url },
    openGraph:  { title: heading, description, url, type: "website" },
    twitter:    { card: "summary_large_image", title: heading, description },
    // Empty combos still render a helpful "browse all" state but must not be
    // indexed. Shared with every other landing page — see _shared/seo.ts.
    ...(await noindexWhenEmpty(comboFilter(slug, city))),
  };
}

export default async function CategoryCityJobsPage({
  params,
  searchParams,
}: {
  params:       Promise<{ slug: string; city: string }>;
  searchParams: Promise<{
    page?:       string;
    search?:     string;
    type?:       string;
    employment?: string;
    level?:      string;
    salary?:     string;
    skill?:      string;
  }>;
}) {
  const { slug, city: citySlug } = await params;
  const city = CITY_BY_SLUG[citySlug];
  if (!city) notFound();

  const cat = await getCategory(slug);
  if (!cat) notFound();

  return <CategoryCityPage category={cat} city={city} searchParams={await searchParams} />;
}
