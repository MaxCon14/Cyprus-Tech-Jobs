import { prisma } from "@/lib/prisma";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "../_components/AdminTable";
import { RowActions } from "../_components/RowActions";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    include: { _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Companies</h1>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>{companies.length} company profiles</p>
      </div>

      <AdminTable columns={["Name", "City", "Size", "Active jobs", "Verified", "Featured", "Actions"]}>
        {companies.map(c => (
          <AdminTr key={c.id}>
            <AdminTd>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              {c.website && <div className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>{c.website}</div>}
            </AdminTd>
            <AdminTd subtle>{c.city ?? "—"}</AdminTd>
            <AdminTd subtle>{c.size ?? "—"}</AdminTd>
            <AdminTd mono>{c._count.jobs}</AdminTd>
            <AdminTd><StatusBadge status={c.verified ? "VERIFIED" : "UNVERIFIED"} /></AdminTd>
            <AdminTd><StatusBadge status={c.featured ? "FEATURED" : "—"} /></AdminTd>
            <AdminTd>
              <RowActions actions={[
                c.verified
                  ? { label: "Unverify", endpoint: `/api/admin/companies/${c.id}`, method: "PATCH", body: { verified: false } }
                  : { label: "Verify",   endpoint: `/api/admin/companies/${c.id}`, method: "PATCH", body: { verified: true } },
                c.featured
                  ? { label: "Unfeature", endpoint: `/api/admin/companies/${c.id}`, method: "PATCH", body: { featured: false } }
                  : { label: "Feature",   endpoint: `/api/admin/companies/${c.id}`, method: "PATCH", body: { featured: true } },
                { label: "Delete", endpoint: `/api/admin/companies/${c.id}`, method: "DELETE", confirm: `Delete "${c.name}"? This will also delete all their jobs.`, destructive: true },
              ]} />
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </div>
  );
}
