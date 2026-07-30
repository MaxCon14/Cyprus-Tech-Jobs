import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JobTypePage, type JobTypeConfig, type JobTypeSearchParams } from "../../_shared/JobTypePage";

export const dynamic = "force-dynamic";

const BASE = "https://cyprustech.careers";

/* One config per employment type. Each carries its own copy so the pages are
   substantively unique, not thin duplicates of one another. */
const CONFIGS: Record<string, JobTypeConfig> = {
  "full-time": {
    displayName: "Full-time",
    slug:        "full-time",
    employment:  "FULL_TIME",
    description: "Find permanent, full-time roles at Cyprus's leading tech companies — from fintech and forex in Limassol to gaming in Nicosia. Full-time positions typically include relocation support, health insurance and clear progression, with salaries shown up front.",
  },
  "part-time": {
    displayName: "Part-time",
    slug:        "part-time",
    employment:  "PART_TIME",
    description: "Browse part-time tech roles in Cyprus for people balancing study, family or a second job. Part-time openings span support, QA, design and development, with flexible hours and every salary listed before you apply.",
  },
  "contract": {
    displayName: "Contract",
    slug:        "contract",
    employment:  "CONTRACT",
    description: "Explore fixed-term and day-rate contract tech jobs in Cyprus. Contract roles are common for project delivery, platform migrations and specialist engineering, often paying a premium — and every rate is shown up front.",
  },
  "internship": {
    displayName: "Internship",
    slug:        "internship",
    employment:  "INTERNSHIP",
    description: "Find tech internships and graduate placements in Cyprus. Internships are a route into fintech, gaming and startups for students and career-changers, with mentorship, real project work and paid positions listed with their salary.",
  },
  "freelance": {
    displayName: "Freelance",
    slug:        "freelance",
    employment:  "FREELANCE",
    description: "Discover freelance and project-based tech work with Cyprus companies. Freelance roles suit independent developers, designers and consultants who want flexible, remote-friendly engagements — every listing states the pay.",
  },
};

export function generateStaticParams() {
  return Object.keys(CONFIGS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cfg = CONFIGS[slug];
  if (!cfg) return { title: "Job type not found" };

  // The root layout applies a `%s | CyprusTech.Careers` template, so the title
  // must NOT repeat the suffix here.
  const title       = `${cfg.displayName} Tech Jobs in Cyprus`;
  const description = `Find ${cfg.displayName.toLowerCase()} tech jobs in Cyprus — open roles in Limassol, Nicosia, Larnaca and remote, every listing with a verified salary. Updated daily.`;
  const url         = `${BASE}/jobs/type/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph:  { title, description, url, type: "website" },
    twitter:    { card: "summary_large_image", title, description },
  };
}

export default async function JobTypeRoute({
  params,
  searchParams,
}: {
  params:       Promise<{ slug: string }>;
  searchParams: Promise<JobTypeSearchParams>;
}) {
  const { slug } = await params;
  const cfg = CONFIGS[slug];
  if (!cfg) notFound();

  return <JobTypePage config={cfg} searchParams={await searchParams} />;
}
