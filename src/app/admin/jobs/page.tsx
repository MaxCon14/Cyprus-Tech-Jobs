import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "../_components/AdminTable";
import { RowActions } from "../_components/RowActions";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    include: {
      company: true,
      category: true,
      _count: { select: { applyClicks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Jobs</h1>
          <p className="body-s" style={{ color: "var(--text-subtle)" }}>{jobs.length} total listings</p>
        </div>
        <Link href="/admin/jobs/new" className="btn btn-accent" style={{ fontSize: 13 }}>+ Add curated job</Link>
      </div>

      <AdminTable columns={["Title", "Company", "Category", "Status", "Clicks", "Posted", "Actions"]}>
        {jobs.map(j => (
          <AdminTr key={j.id}>
            <AdminTd>
              <div style={{ fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title}</div>
            </AdminTd>
            <AdminTd subtle>{j.company.name}</AdminTd>
            <AdminTd subtle>{j.category.name}</AdminTd>
            <AdminTd><StatusBadge status={j.status} /></AdminTd>
            <AdminTd mono right>{j._count.applyClicks}</AdminTd>
            <AdminTd subtle mono>
              {j.postedAt ? new Date(j.postedAt).toLocaleDateString("en-GB") : "—"}
            </AdminTd>
            <AdminTd>
              <RowActions actions={[
                ...(j.status === "ACTIVE"
                  ? [{ label: "Unpublish", endpoint: `/api/admin/jobs/${j.id}`, method: "PATCH" as const, body: { status: "PAUSED" } }]
                  : j.status === "PAUSED"
                  ? [{ label: "Publish", endpoint: `/api/admin/jobs/${j.id}`, method: "PATCH" as const, body: { status: "ACTIVE" } }]
                  : []
                ),
                { label: "Delete", endpoint: `/api/admin/jobs/${j.id}`, method: "DELETE" as const, confirm: `Delete "${j.title}"?`, destructive: true },
              ]} />
              <Link href={`/admin/jobs/${j.id}/edit`} style={{ display: "inline-block", marginTop: 4, fontSize: 11, color: "var(--text-subtle)", textDecoration: "none" }}>Edit →</Link>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </div>
  );
}
