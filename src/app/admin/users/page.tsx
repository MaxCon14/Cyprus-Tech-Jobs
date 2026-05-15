import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "../_components/AdminTable";
import { RowActions } from "../_components/RowActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [employers, { data: candidates }] = await Promise.all([
    prisma.employer.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: true },
    }),
    supabaseAdmin.from("candidates").select("id, email, firstName, lastName, city, experienceLevel, blocked, createdAt").order("createdAt", { ascending: false }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Users</h1>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>{employers.length} employers · {candidates?.length ?? 0} candidates</p>
      </div>

      {/* Employers */}
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Employers</h2>
      <div style={{ marginBottom: 36 }}>
        <AdminTable columns={["Name", "Email", "Company", "Plan", "Slots", "Status", "Joined", "Actions"]}>
          {employers.map(e => (
            <AdminTr key={e.id}>
              <AdminTd>{e.name ?? "—"}</AdminTd>
              <AdminTd subtle mono>{e.email}</AdminTd>
              <AdminTd subtle>{e.company?.name ?? "—"}</AdminTd>
              <AdminTd><StatusBadge status={e.plan} /></AdminTd>
              <AdminTd mono subtle>{e.standardSlots}s / {e.featuredSlots}f</AdminTd>
              <AdminTd><StatusBadge status={e.blocked ? "BLOCKED" : "ACTIVE"} /></AdminTd>
              <AdminTd subtle mono>{new Date(e.createdAt).toLocaleDateString("en-GB")}</AdminTd>
              <AdminTd>
                <RowActions actions={[
                  e.blocked
                    ? { label: "Unblock", endpoint: `/api/admin/users/${e.id}`, method: "PATCH", body: { type: "employer", blocked: false } }
                    : { label: "Block",   endpoint: `/api/admin/users/${e.id}`, method: "PATCH", body: { type: "employer", blocked: true }, confirm: `Block ${e.email}?` },
                  { label: "Delete", endpoint: `/api/admin/users/${e.id}`, method: "DELETE", body: { type: "employer" }, confirm: `Permanently delete ${e.email}?`, destructive: true },
                ]} />
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTable>
      </div>

      {/* Candidates */}
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Candidates</h2>
      <AdminTable columns={["Name", "Email", "City", "Level", "Status", "Joined", "Actions"]}>
        {(candidates ?? []).map(c => (
          <AdminTr key={c.id}>
            <AdminTd>{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</AdminTd>
            <AdminTd subtle mono>{c.email}</AdminTd>
            <AdminTd subtle>{c.city ?? "—"}</AdminTd>
            <AdminTd subtle>{c.experienceLevel ?? "—"}</AdminTd>
            <AdminTd><StatusBadge status={c.blocked ? "BLOCKED" : "ACTIVE"} /></AdminTd>
            <AdminTd subtle mono>{new Date(c.createdAt).toLocaleDateString("en-GB")}</AdminTd>
            <AdminTd>
              <RowActions actions={[
                c.blocked
                  ? { label: "Unblock", endpoint: `/api/admin/users/${c.id}`, method: "PATCH", body: { type: "candidate", blocked: false } }
                  : { label: "Block",   endpoint: `/api/admin/users/${c.id}`, method: "PATCH", body: { type: "candidate", blocked: true }, confirm: `Block ${c.email}?` },
                { label: "Delete", endpoint: `/api/admin/users/${c.id}`, method: "DELETE", body: { type: "candidate" }, confirm: `Permanently delete ${c.email}?`, destructive: true },
              ]} />
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </div>
  );
}
