import { CityPage, type CitySearchParams } from "../_shared/CityPage";
import { noindexWhenEmpty } from "../_shared/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Limassol",
  slug:        "limassol",
  city:        "Limassol",
  description: "Browse tech jobs in Limassol, Cyprus's tech and fintech hub. World-class companies like Revolut, eToro, Exness and more are actively hiring engineers, designers and product professionals.",
} as const;

// Async so the page can be marked noindex while the city has no live jobs —
// see _shared/seo.ts. Everything else here is unchanged.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title:       "Tech Jobs in Limassol, Cyprus",
    description: "Find the latest software engineering, fintech, design and DevOps jobs in Limassol. Updated daily with verified salaries.",
    alternates:  { canonical: "https://cyprustech.careers/jobs/limassol" },
    openGraph: {
      title:       "Tech Jobs in Limassol, Cyprus",
      description: "Browse software engineering, fintech, DevOps and design roles in Limassol — Cyprus's largest tech hub.",
      url:         "https://cyprustech.careers/jobs/limassol",
    },
    ...(await noindexWhenEmpty({ city: CONFIG.city })),
  };
}

export default async function LimassolJobsPage({ searchParams }: { searchParams: Promise<CitySearchParams> }) {
  const params = await searchParams;
  return <CityPage config={CONFIG} searchParams={params} />;
}
