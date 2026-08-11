import { CityPage, type CitySearchParams } from "../_shared/CityPage";
import { noindexWhenEmpty } from "../_shared/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Nicosia",
  slug:        "nicosia",
  city:        "Nicosia",
  description: "Browse tech jobs in Nicosia, Cyprus's capital and largest city. Home to a thriving startup scene, gaming studios, and fintech companies hiring software engineers, product managers, and more.",
} as const;

// Async so the page can be marked noindex while the city has no live jobs —
// see _shared/seo.ts. Everything else here is unchanged.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title:       "Tech Jobs in Nicosia, Cyprus",
    description: "Find the latest software engineering, design, DevOps and product jobs in Nicosia. Updated daily, with pay shown wherever the employer publishes it.",
    alternates:  { canonical: "https://cyprustech.careers/jobs/nicosia" },
    openGraph: {
      title:       "Tech Jobs in Nicosia, Cyprus",
      description: "Browse software engineering, DevOps, design and product roles in Nicosia.",
      url:         "https://cyprustech.careers/jobs/nicosia",
    },
    ...(await noindexWhenEmpty({ city: CONFIG.city })),
  };
}

export default async function NicosiaJobsPage({ searchParams }: { searchParams: Promise<CitySearchParams> }) {
  const params = await searchParams;
  return <CityPage config={CONFIG} searchParams={params} />;
}
