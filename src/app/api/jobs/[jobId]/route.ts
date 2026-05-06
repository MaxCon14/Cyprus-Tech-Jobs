import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ jobId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { jobId } = await params;

  // Auth
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const employer = await prisma.employer.findUnique({
    where: { email: user.email },
    include: { company: true },
  });
  if (!employer?.company) return NextResponse.json({ error: "Employer not found." }, { status: 403 });

  // Verify job belongs to this employer's company
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true } });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  if (job.companyId !== employer.company.id) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title       = typeof body.title === "string" ? body.title.trim() : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : undefined;

  if (title !== undefined && !title)
    return NextResponse.json({ error: "Title cannot be empty." }, { status: 422 });
  if (description !== undefined && description.length < 100)
    return NextResponse.json({ error: "Description must be at least 100 characters." }, { status: 422 });

  const categorySlug    = typeof body.categorySlug === "string" && body.categorySlug ? body.categorySlug : undefined;
  const experienceLevel = typeof body.experienceLevel === "string" ? body.experienceLevel.toUpperCase() : undefined;
  const remoteType      = typeof body.remoteType === "string" ? body.remoteType.toUpperCase().replace("-", "_") : undefined;
  const employmentType  = typeof body.employmentType === "string" ? body.employmentType.toUpperCase().replace("-", "_") : undefined;
  const city            = typeof body.city === "string" ? (body.city.trim() || null) : undefined;
  const salaryMin       = typeof body.salaryMin === "number" && body.salaryMin > 0 ? body.salaryMin : null;
  const salaryMax       = typeof body.salaryMax === "number" && body.salaryMax > 0 ? body.salaryMax : null;
  const status          = typeof body.status === "string" ? body.status.toUpperCase() : undefined;
  const tagNames: string[] = Array.isArray(body.tags)
    ? (body.tags as string[]).map((t) => String(t).trim()).filter(Boolean).slice(0, 10)
    : [];

  // Resolve category if provided
  let categoryId: string | undefined;
  if (categorySlug) {
    const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
    const cat = await prisma.category.upsert({
      where: { slug: categorySlug },
      create: { name: categoryName, slug: categorySlug },
      update: {},
    });
    categoryId = cat.id;
  }

  // Update job
  await prisma.job.update({
    where: { id: jobId },
    data: {
      ...(title           !== undefined && { title }),
      ...(description     !== undefined && { description }),
      ...(categoryId      !== undefined && { categoryId }),
      ...(experienceLevel !== undefined && { experienceLevel: experienceLevel as never }),
      ...(remoteType      !== undefined && { remoteType: remoteType as never }),
      ...(employmentType  !== undefined && { employmentType: employmentType as never }),
      ...(city            !== undefined && { city }),
      ...(status          !== undefined && { status: status as never }),
      salaryMin,
      salaryMax,
    },
  });

  // Replace tags
  await prisma.jobTag.deleteMany({ where: { jobId } });
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
      data: tags.map((tag) => ({ jobId, tagId: tag.id })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ ok: true });
}
