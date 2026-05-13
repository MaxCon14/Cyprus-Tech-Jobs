import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const CATEGORY_NAMES: Record<string, string> = {
  frontend: "Frontend", backend: "Backend", devops: "DevOps",
  design: "Design", data: "Data", mobile: "Mobile",
  product: "Product", security: "Security", qa: "QA", "full-stack": "Full Stack",
};

const REMOTE_TYPE_MAP: Record<string, string> = {
  Remote: "REMOTE", Hybrid: "HYBRID", "On-site": "ON_SITE",
};
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "Full-time": "FULL_TIME", "Part-time": "PART_TIME",
  Contract: "CONTRACT", Internship: "INTERNSHIP", Freelance: "FREELANCE",
};
const EXPERIENCE_LEVEL_MAP: Record<string, string> = {
  Junior: "JUNIOR", "Mid-level": "MID", Senior: "SENIOR",
  Lead: "LEAD", Executive: "EXECUTIVE",
};

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const employer = await prisma.employer.findUnique({
    where:   { email: user.email },
    include: { company: true },
  });
  if (!employer) {
    return NextResponse.json({ error: "Employer not found." }, { status: 404 });
  }

  let body: Record<string, string | number | boolean | null | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const companyName  = typeof body.companyName  === "string" ? body.companyName.trim()  : null;
  const jobTitle     = typeof body.jobTitle     === "string" ? body.jobTitle.trim()     : null;
  const categorySlug = typeof body.category     === "string" ? body.category            : null;

  if (!companyName)   return NextResponse.json({ error: "Company name is required to save a draft." }, { status: 422 });
  if (!jobTitle)      return NextResponse.json({ error: "Job title is required to save a draft." }, { status: 422 });
  if (!categorySlug)  return NextResponse.json({ error: "Please select a category to save a draft." }, { status: 422 });

  try {
    const companySlug = slugify(companyName);
    const existingCo  = await prisma.company.findUnique({ where: { slug: companySlug } });
    const finalCoSlug = existingCo ? existingCo.slug : companySlug;
    const company     = await prisma.company.upsert({
      where:  { slug: finalCoSlug },
      create: {
        name:        companyName,
        slug:        finalCoSlug,
        website:     (body.companyWebsite     as string | undefined)?.trim() || undefined,
        description: (body.companyDescription as string | undefined)?.trim() || undefined,
      },
      update: {},
    });

    if (!employer.companyId) {
      await prisma.employer.update({ where: { id: employer.id }, data: { companyId: company.id } });
    }

    const category = await prisma.category.upsert({
      where:  { slug: categorySlug },
      create: { name: CATEGORY_NAMES[categorySlug] ?? categorySlug, slug: categorySlug },
      update: {},
    });

    const baseSlug    = slugify(`${jobTitle}-${companyName}`);
    const existingJob = await prisma.job.findUnique({ where: { slug: baseSlug } });
    const jobSlug     = existingJob
      ? `${baseSlug}-draft-${Date.now().toString(36).slice(-4)}`
      : baseSlug;

    const salaryDisclosed = body.salaryDisclosed !== false;

    const job = await prisma.job.create({
      data: {
        slug:            jobSlug,
        title:           jobTitle,
        description:     (body.description as string | undefined)?.trim() ?? "",
        status:          "DRAFT",
        featured:        false,
        companyId:       company.id,
        categoryId:      category.id,
        remoteType:      (REMOTE_TYPE_MAP[(body.remoteType as string) ?? ""] ?? "ON_SITE") as never,
        employmentType:  (EMPLOYMENT_TYPE_MAP[(body.employmentType as string) ?? ""] ?? "FULL_TIME") as never,
        experienceLevel: (EXPERIENCE_LEVEL_MAP[(body.experienceLevel as string) ?? ""] ?? "MID") as never,
        city:            (body.city     as string | undefined)?.trim() || undefined,
        salaryDisclosed,
        salaryMin:       salaryDisclosed && body.salaryMin ? Number(body.salaryMin) : undefined,
        salaryMax:       salaryDisclosed && body.salaryMax ? Number(body.salaryMax) : undefined,
        applyType:       ["URL", "EMAIL", "IN_APP"].includes(body.applyType as string) ? (body.applyType as string) : "URL",
        applyUrl:        (body.applyUrl   as string | undefined)?.trim() || undefined,
        applyEmail:      (body.applyEmail as string | undefined)?.trim() || undefined,
      },
    });

    // Link selected skill tags to the draft
    const tagNames = (() => {
      try { return JSON.parse(body.tags as string) as string[]; } catch { return []; }
    })();
    if (tagNames.length > 0) {
      const tagRecords = await prisma.tag.findMany({ where: { name: { in: tagNames } } });
      await prisma.jobTag.createMany({
        data: tagRecords.map(t => ({ jobId: job.id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ jobId: job.id, jobSlug: job.slug }, { status: 201 });
  } catch (err) {
    console.error("[jobs/draft POST]", err);
    return NextResponse.json({ error: "Failed to save draft. Please try again." }, { status: 500 });
  }
}
