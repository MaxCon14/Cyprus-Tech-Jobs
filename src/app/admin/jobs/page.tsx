import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeading } from "../_components/AdminUI";
import { JobsTableClient } from "../_components/JobsTableClient";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const status = typeof params.status === "string" && ["ACTIVE", "DRAFT", "PAUSED", "EXPIRED", "CLOSED"].includes(params.status) ? params.status : "ALL";
  const query = typeof params.q === "string" ? params.q : "";
  const jobs = await prisma.job.findMany({
    include: {
      company:  { select: { name: true } },
      category: { select: { name: true } },
      _count:   { select: { applyClicks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeading eyebrow="Manage your board" title="Job listings" description="Publish opportunities, review links, and keep every listing up to date." actions={<Link href="/admin/jobs/new" className="adm-button adm-button-primary"><Plus size={16} /> Add a job</Link>} />

      <JobsTableClient
        key={`${status}-${query}-${params.flagged}-${params.expiring}`}
        initialStatus={status} initialQuery={query} initialFlagged={params.flagged === "1"} initialExpiring={params.expiring === "1"} referenceTime={new Date().toISOString()}
        jobs={jobs.map(j => ({
          id: j.id,
          expiresAt: j.expiresAt?.toISOString() ?? null,
          applyUrl: j.applyUrl,
          title: j.title,
          isCurated: j.isCurated,
          companyDisplay: j.curatedCompanyName ?? j.company?.name ?? "—",
          category: { name: j.category.name },
          status: j.status,
          _count: { applyClicks: j._count.applyClicks },
          postedAt: j.postedAt?.toISOString() ?? null,
          applyUrlBroken: j.applyUrlBroken,
          applyUrlCheckedAt: j.applyUrlCheckedAt?.toISOString() ?? null,
          applyUrlCheckReason: j.applyUrlCheckReason,
        }))}
      />
    </div>
  );
}
