import { prisma } from "@/lib/prisma";
import { CompaniesTableClient } from "../_components/CompaniesTableClient";

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
      </div>

      <CompaniesTableClient
        companies={companies.map(c => ({
          id: c.id,
          name: c.name,
          website: c.website ?? null,
          city: c.city ?? null,
          size: c.size ?? null,
          _count: { jobs: c._count.jobs },
          verified: c.verified,
          featured: c.featured,
        }))}
      />
    </div>
  );
}
