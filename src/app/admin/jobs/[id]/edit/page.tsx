import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminJobForm } from "../../../_components/AdminJobForm";

export const dynamic = "force-dynamic";

export default async function AdminJobEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [job, companies, categories] = await Promise.all([
    prisma.job.findUnique({ where: { id } }),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!job) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        Edit job — <span style={{ color: "var(--text-muted)" }}>{job.title}</span>
      </h1>
      <AdminJobForm
        companies={companies}
        categories={categories}
        jobId={id}
        initial={{
          title: job.title,
          description: job.description,
          companyId: job.companyId,
          categoryId: job.categoryId,
          city: job.city ?? "",
          remoteType: job.remoteType,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          salaryMin: job.salaryMin?.toString() ?? "",
          salaryMax: job.salaryMax?.toString() ?? "",
          salaryDisclosed: job.salaryDisclosed,
          applyType: job.applyType,
          applyUrl: job.applyUrl ?? "",
          applyEmail: job.applyEmail ?? "",
          featured: job.featured,
          status: job.status,
        }}
      />
    </div>
  );
}
