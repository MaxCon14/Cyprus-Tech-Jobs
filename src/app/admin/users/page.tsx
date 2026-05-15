import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { UsersTableClient } from "../_components/UsersTableClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [employers, { data: candidates }] = await Promise.all([
    prisma.employer.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true } } },
    }),
    supabaseAdmin
      .from("candidates")
      .select("id, email, firstName, lastName, city, experienceLevel, blocked, createdAt")
      .order("createdAt", { ascending: false }),
  ]);

  // Serialize dates to strings for client component
  const employerData = employers.map(e => ({
    id: e.id,
    name: e.name ?? null,
    email: e.email,
    company: e.company ? { name: e.company.name } : null,
    plan: e.plan,
    standardSlots: e.standardSlots,
    featuredSlots: e.featuredSlots,
    blocked: e.blocked,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Users</h1>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>
          {employers.length} employers · {candidates?.length ?? 0} candidates
        </p>
      </div>

      <UsersTableClient
        employers={employerData}
        candidates={(candidates ?? []).map(c => ({
          id: c.id,
          email: c.email,
          firstName: c.firstName ?? null,
          lastName: c.lastName ?? null,
          city: c.city ?? null,
          experienceLevel: c.experienceLevel ?? null,
          blocked: c.blocked ?? false,
          createdAt: c.createdAt,
        }))}
      />
    </div>
  );
}
