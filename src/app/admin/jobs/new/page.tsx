import { prisma } from "@/lib/prisma";
import { AdminJobForm } from "../../_components/AdminJobForm";

export const dynamic = "force-dynamic";

export default async function AdminJobNewPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Add curated job</h1>
      <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
        Post a job on behalf of a company. Applicants are redirected to the original posting.
      </p>
      <AdminJobForm categories={categories} />
    </div>
  );
}
