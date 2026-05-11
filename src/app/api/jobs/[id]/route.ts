import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CATEGORY_NAMES: Record<string, string> = {
  frontend: "Frontend", backend: "Backend", devops: "DevOps & Cloud",
  design: "UI/UX Design", data: "Data & Analytics", mobile: "Mobile",
  product: "Product", security: "Security", qa: "QA & Testing",
};

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
    city, salaryDisclosed, salaryMin, salaryMax, applyUrl, applyEmail,
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
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  const category = await prisma.category.upsert({
    where:  { slug: categorySlug as string },
    create: { name: CATEGORY_NAMES[categorySlug as string] ?? String(categorySlug), slug: categorySlug as string },
    update: {},
  });

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
        salaryDisclosed: salaryDisclosed !== false,
        salaryMin:       salaryDisclosed !== false && salaryMin ? Number(salaryMin) : null,
        salaryMax:       salaryDisclosed !== false && salaryMax ? Number(salaryMax) : null,
        applyUrl:        (applyUrl    as string | undefined)?.trim() || undefined,
        applyEmail:      (applyEmail  as string | undefined)?.trim() || undefined,
      },
    });
    return NextResponse.json({ jobSlug: updated.slug });
  } catch (err) {
    console.error("[jobs/patch]", err);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  }
}
