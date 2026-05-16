import { CityPage } from "../_shared/CityPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Famagusta",
  slug:        "famagusta",
  city:        "Famagusta",
  description: "Browse tech jobs in Famagusta, Cyprus. Explore software engineering and IT opportunities in the Famagusta district.",
} as const;

export const metadata: Metadata = {
  title:       "Tech Jobs in Famagusta, Cyprus | CyprusTech.Jobs",
  description: "Find the latest software engineering and IT jobs in Famagusta, Cyprus. Updated daily.",
  alternates:  { canonical: "https://cyprustech.careers/jobs/famagusta" },
  openGraph: {
    title:       "Tech Jobs in Famagusta, Cyprus",
    description: "Browse software engineering and IT roles in Famagusta.",
    url:         "https://cyprustech.careers/jobs/famagusta",
  },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function FamagustaJobsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1") || 1);
  return <CityPage config={CONFIG} pageNum={pageNum} />;
}
