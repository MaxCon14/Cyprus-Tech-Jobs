import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PageHeading } from "../_components/AdminUI";
import { UsersTableClient } from "../_components/UsersTableClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const [employers, { data: candidates, error: candidateError }] = await Promise.all([
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
      <PageHeading eyebrow="Your community" title="People" description="Manage employer and candidate accounts in one place." />
      {candidateError && <div className="adm-notice is-error" role="alert">Candidate accounts could not be loaded. Refresh to try again.</div>}
      <UsersTableClient key={type} initialType={type === "candidates" ? "candidates" : "employers"}
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
