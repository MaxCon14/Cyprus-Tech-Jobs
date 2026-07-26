import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notifyGoogle } from "@/lib/google-indexing";
import { validateSalaryRange } from "@/lib/utils";
import { findCategoryBySlug } from "@/lib/queries";
import { UNKNOWN_CATEGORY_MESSAGE } from "@/lib/taxonomy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;

  const employer = await prisma.employer.findUnique({
    where:   { email: user.email },
    include: { company: true },
  });
  if (!employer?.company) {
    return NextResponse.json({ error: "Employer not found." }, { status: 404 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.companyId !== employer.company.id) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  let body: Record<string, string | number | boolean | null | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const {
    title, description, categorySlug,
    remoteType, employmentType, experienceLevel,
    city, salaryMin, salaryMax, applyUrl, applyEmail,
    coverLetter,
    tags: rawTags,
  } = body;

  const errors: string[] = [];
  if (!String(title       ?? "").trim()) errors.push("Job title is required.");
  if (!categorySlug)                     errors.push("Category is required.");
  if (!remoteType)                       errors.push("Work type is required.");
  if (!employmentType)                   errors.push("Employment type is required.");
  if (!experienceLevel)                  errors.push("Experience level is required.");
  if (!String(description ?? "").trim()) errors.push("Job description is required.");
  if (!String(applyUrl    ?? "").trim() && !String(applyEmail ?? "").trim()) {
    errors.push("Application URL or email is required.");
  }
  errors.push(...validateSalaryRange(salaryMin, salaryMax));
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  /* Look the category up; do not create it. Upserting here minted a parentless
     category named after whatever slug arrived, and its jobs then matched no
     category page on the site. */
  const category = await findCategoryBySlug(categorySlug as string);
  if (!category) return NextResponse.json({ error: UNKNOWN_CATEGORY_MESSAGE }, { status: 422 });

  try {
    const updated = await prisma.job.update({
      where: { id },
      data: {
        title:           String(title).trim(),
        description:     String(description).trim(),
        categoryId:      category.id,
        remoteType:      remoteType      as never,
        employmentType:  employmentType  as never,
        experienceLevel: experienceLevel as never,
        city:            (city as string | undefined)?.trim() || undefined,
        salaryDisclosed: true,
        salaryMin:       Number(salaryMin),
        salaryMax:       Number(salaryMax),
        applyUrl:        (applyUrl    as string | undefined)?.trim() || undefined,
        applyEmail:      (applyEmail  as string | undefined)?.trim() || undefined,
        coverLetter:     ["REQUIRED", "OPTIONAL", "NONE"].includes(coverLetter as string) ? (coverLetter as string) : "OPTIONAL",
      },
    });

    // Replace skill tags
    const tagNames = (() => {
      try { return JSON.parse(rawTags as string) as string[]; } catch { return []; }
    })();
    await prisma.jobTag.deleteMany({ where: { jobId: id } });
    if (tagNames.length > 0) {
      const tagRecords = await prisma.tag.findMany({ where: { name: { in: tagNames } } });
      await prisma.jobTag.createMany({
        data: tagRecords.map(t => ({ jobId: id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    // If the job is active, re-ping Google so updated content gets re-indexed
    if (job.status === "ACTIVE") void notifyGoogle(updated.slug, "URL_UPDATED");

    return NextResponse.json({ jobSlug: updated.slug });
  } catch (err) {
    console.error("[jobs/patch]", err);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;

  const employer = await prisma.employer.findUnique({
    where:   { email: user.email },
    include: { company: true },
  });
  if (!employer?.company) {
    return NextResponse.json({ error: "Employer not found." }, { status: 404 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.companyId !== employer.company.id) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  try {
    await prisma.job.update({ where: { id }, data: { status: "CLOSED" } });
    // Tell Google to remove this URL from Jobs results
    void notifyGoogle(job.slug, "URL_DELETED");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[jobs/delete]", err);
    return NextResponse.json({ error: "Failed to close job." }, { status: 500 });
  }
}
