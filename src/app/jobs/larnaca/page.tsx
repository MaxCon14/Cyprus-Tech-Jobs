import { CityPage } from "../_shared/CityPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Larnaca",
  slug:        "larnaca",
  city:        "Larnaca",
  description: "Browse tech jobs in Larnaca, a growing hub for technology and digital businesses in Cyprus. Find software engineering, IT, and product roles at companies based in Larnaca.",
} as const;

export const metadata: Metadata = {
  title:       "Tech Jobs in Larnaca, Cyprus | CyprusTech.Jobs",
  description: "Find the latest software engineering, IT and product jobs in Larnaca, Cyprus. Updated daily with verified salaries.",
  alternates:  { canonical: "https://cyprustech.careers/jobs/larnaca" },
  openGraph: {
    title:       "Tech Jobs in Larnaca, Cyprus",
    description: "Browse software engineering, IT and product roles in Larnaca.",
    url:         "https://cyprustech.careers/jobs/larnaca",
  },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function LarnacaJobsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1") || 1);
  return <CityPage config={CONFIG} pageNum={pageNum} />;
}
