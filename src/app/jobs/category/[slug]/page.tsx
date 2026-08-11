import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoryPage } from "../../_shared/CategoryPage";
import { noindexWhenEmpty } from "../../_shared/seo";

export const dynamic = "force-dynamic";

const BASE = "https://cyprustech.careers";

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where:   { slug },
    include: {
      parent:   { select: { name: true, slug: true } },
      children: { select: { name: true, slug: true }, orderBy: { name: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug).catch(() => null);
  if (!cat) return { title: "Category not found" };

  // The root layout applies a `%s | CyprusTech.Careers` template, so the title
  // must NOT include the suffix here or it doubles.
  const title       = `${cat.name} Jobs in Cyprus`;
  const description = `Find the latest ${cat.name} jobs in Cyprus — open roles in Limassol, Nicosia, Larnaca and remote, with pay shown wherever the employer publishes it. Updated daily.`;
  const url         = `${BASE}/jobs/category/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph:  { title: `${cat.name} Jobs in Cyprus`, description, url, type: "website" },
    twitter:    { card: "summary_large_image", title: `${cat.name} Jobs in Cyprus`, description },
    // A category with nothing behind it is a soft 404 to Google — see
    // _shared/seo.ts. getJobCount treats a parent slug as matching its
    // children's jobs, so a parent stays indexable while any child has one.
    ...(await noindexWhenEmpty({ categorySlug: slug })),
  };
}

export default async function CategoryJobsPage({
  params,
  searchParams,
}: {
  params:       Promise<{ slug: string }>;
  searchParams: Promise<{
    page?:       string;
    search?:     string;
    type?:       string;
    employment?: string;
    level?:      string;
    city?:       string;
    salary?:     string;
    skill?:      string;
  }>;
}) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) notFound();

  return <CategoryPage category={cat} searchParams={await searchParams} />;
}
