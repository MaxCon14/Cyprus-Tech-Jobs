import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  // Auth — must be a logged-in employer
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "You must be signed in as an employer to post a job." }, { status: 401 });
  }

  const employer = await prisma.employer.findUnique({
    where: { email: user.email },
    include: { company: true },
  });
  if (!employer) {
    return NextResponse.json({ error: "Employer account not found. Please complete onboarding first." }, { status: 403 });
  }
  if (!employer.company) {
    return NextResponse.json({ error: "No company linked to your account. Please complete onboarding." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Validate required fields
  const title       = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const categorySlug = typeof body.categorySlug === "string" ? body.categorySlug.trim() : "";

  if (!title)        return NextResponse.json({ error: "Job title is required." }, { status: 422 });
  if (!description || description.length < 100)
    return NextResponse.json({ error: "Description must be at least 100 characters." }, { status: 422 });
  if (!categorySlug) return NextResponse.json({ error: "Category is required." }, { status: 422 });

  const experienceLevel = typeof body.experienceLevel === "string" ? body.experienceLevel.toUpperCase() : "MID";
  const remoteType      = typeof body.remoteType === "string" ? body.remoteType.toUpperCase().replace("-", "_") : "ON_SITE";
  const employmentType  = typeof body.employmentType === "string" ? body.employmentType.toUpperCase().replace("-", "_") : "FULL_TIME";
  const city            = typeof body.city === "string" ? body.city.trim() || null : null;
  const salaryMin       = typeof body.salaryMin === "number" && body.salaryMin > 0 ? body.salaryMin : null;
  const salaryMax       = typeof body.salaryMax === "number" && body.salaryMax > 0 ? body.salaryMax : null;
  const tagNames: string[] = Array.isArray(body.tags)
    ? (body.tags as string[]).map((t) => t.trim()).filter(Boolean).slice(0, 10)
    : [];

  // Find or create category
  const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    create: { name: categoryName, slug: categorySlug },
    update: {},
  });

  // Generate unique slug
  const baseSlug = `${slugify(title)}-${employer.company.slug}`;
  const existing = await prisma.job.findFirst({ where: { slug: { startsWith: baseSlug } }, orderBy: { createdAt: "desc" } });
  const jobSlug = existing ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

  const postedAt  = new Date();
  const expiresAt = new Date(postedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

  const job = await prisma.job.create({
    data: {
      slug:           jobSlug,
      title,
      description,
      experienceLevel: experienceLevel as never,
      remoteType:      remoteType as never,
      employmentType:  employmentType as never,
      city,
      salaryMin,
      salaryMax,
      status:    "ACTIVE",
      postedAt,
      expiresAt,
      companyId: employer.company.id,
      categoryId: category.id,
    },
  });

  // Upsert tags and create junction records
  if (tagNames.length > 0) {
    const tags = await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({
          where:  { slug: slugify(name) },
          create: { name, slug: slugify(name) },
          update: {},
        })
      )
    );
    await prisma.jobTag.createMany({
      data: tags.map((tag) => ({ jobId: job.id, tagId: tag.id })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ jobId: job.id, slug: job.slug }, { status: 201 });
}
