import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { JobsTableClient } from "../_components/JobsTableClient";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, margin: 0 }}>Jobs</h1>
        <Link href="/admin/jobs/new" className="btn btn-accent" style={{ fontSize: 13 }}>+ Add curated job</Link>
      </div>

      <JobsTableClient
        jobs={jobs.map(j => ({
          id: j.id,
          title: j.title,
          company: { name: j.company.name },
          category: { name: j.category.name },
          status: j.status,
          _count: { applyClicks: j._count.applyClicks },
          postedAt: j.postedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
