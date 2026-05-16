import { CityPage } from "../_shared/CityPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Paphos",
  slug:        "paphos",
  city:        "Paphos",
  description: "Browse tech jobs in Paphos, Cyprus. Discover software engineering, IT and digital roles at companies operating in Paphos and the surrounding area.",
} as const;

export const metadata: Metadata = {
  title:       "Tech Jobs in Paphos, Cyprus | CyprusTech.Jobs",
  description: "Find the latest software engineering, IT and digital jobs in Paphos, Cyprus. Updated daily with verified salaries.",
  alternates:  { canonical: "https://cyprustech.careers/jobs/paphos" },
  openGraph: {
    title:       "Tech Jobs in Paphos, Cyprus",
    description: "Browse software engineering, IT and digital roles in Paphos.",
    url:         "https://cyprustech.careers/jobs/paphos",
  },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function PaphosJobsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1") || 1);
  return <CityPage config={CONFIG} pageNum={pageNum} />;
}
