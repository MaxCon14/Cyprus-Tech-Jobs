import { CityPage } from "../_shared/CityPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const CONFIG = {
  displayName: "Remote",
  slug:        "remote",
  isRemote:    true,
  description: "Browse remote tech jobs at Cyprus-based companies. Work from anywhere while being part of Cyprus's fast-growing tech ecosystem — roles in software engineering, product, design and more.",
} as const;

export const metadata: Metadata = {
  title:       "Remote Tech Jobs at Cyprus Companies | CyprusTech.Jobs",
  description: "Find remote software engineering, design and product jobs at Cyprus-based companies. Work from anywhere. Updated daily with verified salaries.",
  alternates:  { canonical: "https://cyprustech.careers/jobs/remote" },
  openGraph: {
    title:       "Remote Tech Jobs at Cyprus Companies",
    description: "Work from anywhere for a Cyprus tech company — software engineering, product, design and more.",
    url:         "https://cyprustech.careers/jobs/remote",
  },
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function RemoteJobsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1") || 1);
  return <CityPage config={CONFIG} pageNum={pageNum} />;
}
