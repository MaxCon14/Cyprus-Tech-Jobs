import { prisma } from "@/lib/prisma";
import { AdminJobForm } from "../../_components/AdminJobForm";

export const dynamic = "force-dynamic";

export default async function AdminJobNewPage() {
  const [companies, categories] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Add curated job</h1>
      <AdminJobForm companies={companies} categories={categories} />
    </div>
  );
}
