import { CityPage, type CitySearchParams } from "../_shared/CityPage";
import { noindexWhenEmpty } from "../_shared/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Larnaca",
  slug:        "larnaca",
  city:        "Larnaca",
  description: "Browse tech jobs in Larnaca, a growing hub for technology and digital businesses in Cyprus. Find software engineering, IT, and product roles at companies based in Larnaca.",
} as const;

// Async so the page can be marked noindex while the city has no live jobs —
// see _shared/seo.ts. Everything else here is unchanged.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title:       "Tech Jobs in Larnaca, Cyprus",
    description: "Find the latest software engineering, IT and product jobs in Larnaca, Cyprus. Updated daily, with pay shown wherever the employer publishes it.",
    alternates:  { canonical: "https://cyprustech.careers/jobs/larnaca" },
    openGraph: {
      title:       "Tech Jobs in Larnaca, Cyprus",
      description: "Browse software engineering, IT and product roles in Larnaca.",
      url:         "https://cyprustech.careers/jobs/larnaca",
    },
    ...(await noindexWhenEmpty({ city: CONFIG.city })),
  };
}

export default async function LarnacaJobsPage({ searchParams }: { searchParams: Promise<CitySearchParams> }) {
  const params = await searchParams;
  return <CityPage config={CONFIG} searchParams={params} />;
}
