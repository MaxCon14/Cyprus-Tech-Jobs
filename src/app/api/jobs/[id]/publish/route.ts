import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notifyGoogle } from "@/lib/google-indexing";

const CATEGORY_NAMES: Record<string, string> = {
  frontend: "Frontend", backend: "Backend", devops: "DevOps & Cloud",
  design: "UI/UX Design", data: "Data & Analytics", mobile: "Mobile",
  product: "Product", security: "Security", qa: "QA & Testing", "full-stack": "Full Stack",
};

export async function POST(
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
  if (job.status !== "DRAFT") {
    return NextResponse.json({ error: "Only draft listings can be published." }, { status: 400 });
  }

  let body: Record<string, string | number | boolean | null | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const {
    listingType, title, description, categorySlug,
    remoteType, employmentType, experienceLevel,
    city, salaryDisclosed, salaryMin, salaryMax, applyUrl, applyEmail,
  } = body;

  // Full validation for publishing
  const errors: string[] = [];
  if (!listingType || !["standard", "featured"].includes(listingType as string))
    errors.push("Invalid listing type.");
  if (!String(title       ?? "").trim()) errors.push("Job title is required.");
  if (!categorySlug)                     errors.push("Category is required.");
  if (!remoteType)                       errors.push("Work type is required.");
  if (!employmentType)                   errors.push("Employment type is required.");
  if (!experienceLevel)                  errors.push("Experience level is required.");
  if (!String(description ?? "").trim()) errors.push("Job description is required.");
  if (!String(applyUrl ?? "").trim() && !String(applyEmail ?? "").trim()) {
    errors.push("Application URL or email is required.");
  }
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  // Check slot availability
  const needsFeatured = listingType === "featured";
  if (needsFeatured && employer.featuredSlots < 1) {
    return NextResponse.json({ error: "No featured listing slots available." }, { status: 402 });
  }
  if (!needsFeatured && employer.standardSlots < 1) {
    return NextResponse.json({ error: "No standard listing slots available." }, { status: 402 });
  }

  const category = await prisma.category.upsert({
    where:  { slug: categorySlug as string },
    create: { name: CATEGORY_NAMES[categorySlug as string] ?? String(categorySlug), slug: categorySlug as string },
    update: {},
  });

  const now      = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);

  try {
    const [, updated] = await prisma.$transaction([
      prisma.employer.update({
        where: { id: employer.id },
        data: needsFeatured
          ? { featuredSlots: { decrement: 1 } }
          : { standardSlots: { decrement: 1 } },
      }),
      prisma.job.update({
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
          applyUrl:        (applyUrl   as string | undefined)?.trim() || undefined,
          applyEmail:      (applyEmail as string | undefined)?.trim() || undefined,
          featured:        needsFeatured,
          status:          "ACTIVE",
          postedAt:        now,
          expiresAt,
          activeDays:      0,
          inactiveDays:    0,
        },
      }),
    ]);

    // Notify Google Indexing API — non-blocking
    void notifyGoogle(updated.slug, "URL_UPDATED");

    return NextResponse.json({ jobSlug: updated.slug });
  } catch (err) {
    console.error("[jobs/publish]", err);
    return NextResponse.json({ error: "Failed to publish. Please try again." }, { status: 500 });
  }
}
