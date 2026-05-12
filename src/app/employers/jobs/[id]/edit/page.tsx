import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getJobById, getCategoriesWithCount } from "@/lib/queries";
import { EditJobForm } from "./EditJobForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Listing — CyprusTech.Jobs" };

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/login");
  }

  const employer = await prisma.employer.findUnique({
    where:   { email: user.email },
    include: { company: true },
  });
  if (!employer) redirect("/employers/onboarding");

  const job = await getJobById(id);
  if (!job || (employer.company && job.companyId !== employer.company.id)) {
    redirect("/employers/dashboard");
  }

  const categories = await getCategoriesWithCount();
  const isDraft    = job.status === "DRAFT";

  const jobData = {
    id:              job.id,
    slug:            job.slug,
    title:           job.title,
    description:     job.description,
    categorySlug:    job.category.slug,
    remoteType:      job.remoteType      as string,
    employmentType:  job.employmentType  as string,
    experienceLevel: job.experienceLevel as string,
    city:            job.city ?? "",
    salaryMin:       job.salaryMin  ?? "",
    salaryMax:       job.salaryMax  ?? "",
    salaryDisclosed: job.salaryDisclosed,
    applyUrl:        job.applyUrl   ?? "",
    applyEmail:      job.applyEmail ?? "",
  };

  const pageTitle = isDraft ? "Edit draft" : "Edit listing";
  const pageDesc  = isDraft
    ? "Complete the details below, then publish when ready."
    : "Update your listing details below. Changes go live immediately.";

  return (
    <div>
      <div style={{ borderBottom: "1px solid var(--border)", padding: "clamp(36px,5vw,56px) var(--page-padding-x)", background: "var(--bg-alt)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            {pageTitle.toUpperCase()} · CYPRUSTECHJOBS
          </div>
          <h1 className="display-l" style={{ marginBottom: 8 }}>{job.title}</h1>
          <p className="body-l" style={{ color: "var(--text-muted)" }}>{pageDesc}</p>
        </div>
      </div>

      <div className="page-container" style={{ paddingBlock: "clamp(36px,5vw,56px)" }}>
        <EditJobForm
          job={jobData}
          categories={categories.slice(1)}
          isDraft={isDraft}
          standardSlots={employer.standardSlots}
          featuredSlots={employer.featuredSlots}
        />
      </div>
    </div>
  );
}
