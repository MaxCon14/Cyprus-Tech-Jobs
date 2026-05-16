import { prisma } from "@/lib/prisma";
import { AdminJobForm } from "../../_components/AdminJobForm";

export const dynamic = "force-dynamic";

export default async function AdminJobNewPage() {
  const [categories, allTagRows] = await Promise.all([
    prisma.category.findMany({
      where:   { parentId: null },
      orderBy: { name: "asc" },
      include: { children: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Add curated job</h1>
      <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
        Post a job on behalf of a company. Applicants are redirected to the original posting.
      </p>
      <AdminJobForm categories={categories} allTags={allTagRows.map(t => t.name)} />
    </div>
  );
}
