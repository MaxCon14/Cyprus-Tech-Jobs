import { CityPage } from "../_shared/CityPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Nicosia",
  slug:        "nicosia",
  city:        "Nicosia",
  description: "Browse tech jobs in Nicosia, Cyprus's capital and largest city. Home to a thriving startup scene, gaming studios, and fintech companies hiring software engineers, product managers, and more.",
} as const;

export const metadata: Metadata = {
  title:       "Tech Jobs in Nicosia, Cyprus | CyprusTech.Jobs",
  description: "Find the latest software engineering, design, DevOps and product jobs in Nicosia. Updated daily with verified salaries.",
  alternates:  { canonical: "https://cyprustech.careers/jobs/nicosia" },
  openGraph: {
    title:       "Tech Jobs in Nicosia, Cyprus",
    description: "Browse software engineering, DevOps, design and product roles in Nicosia.",
    url:         "https://cyprustech.careers/jobs/nicosia",
  },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function NicosiaJobsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1") || 1);
  return <CityPage config={CONFIG} pageNum={pageNum} />;
}
