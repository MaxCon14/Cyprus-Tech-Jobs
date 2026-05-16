import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminJobForm } from "../../../_components/AdminJobForm";

export const dynamic = "force-dynamic";

export default async function AdminJobEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [job, categories, allTagRows] = await Promise.all([
    prisma.job.findUnique({ where: { id }, include: { company: { select: { name: true } }, tags: { include: { tag: { select: { name: true } } } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  if (!job) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        Edit job — <span style={{ color: "var(--text-muted)" }}>{job.title}</span>
      </h1>
      <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
        Changes go live immediately.
      </p>
      <AdminJobForm
        categories={categories}
        allTags={allTagRows.map(t => t.name)}
        initialTags={job.tags.map(jt => jt.tag.name)}
        jobId={id}
        initial={{
          title:          job.title,
          description:    job.description,
          companyName:    job.isCurated && job.curatedCompanyName ? job.curatedCompanyName : job.company.name,
          categoryId:     job.categoryId,
          city:           job.city ?? "",
          remoteType:     job.remoteType,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          salaryMin:      job.salaryMin?.toString() ?? "",
          salaryMax:      job.salaryMax?.toString() ?? "",
          salaryDisclosed: job.salaryDisclosed,
          applyUrl:       job.applyUrl ?? "",
          featured:       job.featured,
          status:         job.status,
        }}
      />
    </div>
  );
}
