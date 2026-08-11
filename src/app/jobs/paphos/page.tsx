import { CityPage, type CitySearchParams } from "../_shared/CityPage";
import { noindexWhenEmpty } from "../_shared/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Paphos",
  slug:        "paphos",
  city:        "Paphos",
  description: "Browse tech jobs in Paphos, Cyprus. Discover software engineering, IT and digital roles at companies operating in Paphos and the surrounding area.",
} as const;

// Async so the page can be marked noindex while the city has no live jobs —
// see _shared/seo.ts. Everything else here is unchanged.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title:       "Tech Jobs in Paphos, Cyprus",
    description: "Find the latest software engineering, IT and digital jobs in Paphos, Cyprus. Updated daily, with pay shown wherever the employer publishes it.",
    alternates:  { canonical: "https://cyprustech.careers/jobs/paphos" },
    openGraph: {
      title:       "Tech Jobs in Paphos, Cyprus",
      description: "Browse software engineering, IT and digital roles in Paphos.",
      url:         "https://cyprustech.careers/jobs/paphos",
    },
    ...(await noindexWhenEmpty({ city: CONFIG.city })),
  };
}

export default async function PaphosJobsPage({ searchParams }: { searchParams: Promise<CitySearchParams> }) {
  const params = await searchParams;
  return <CityPage config={CONFIG} searchParams={params} />;
}
