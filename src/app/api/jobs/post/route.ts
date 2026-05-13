import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const CATEGORY_NAMES: Record<string, string> = {
  frontend:    "Frontend",
  backend:     "Backend",
  devops:      "DevOps",
  design:      "Design",
  data:        "Data",
  mobile:      "Mobile",
  product:     "Product",
  security:    "Security",
  qa:          "QA",
  "full-stack":"Full Stack",
};

const REMOTE_TYPE_MAP: Record<string, string> = {
  Remote:   "REMOTE",
  Hybrid:   "HYBRID",
  "On-site":"ON_SITE",
};

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract:    "CONTRACT",
  Internship:  "INTERNSHIP",
  Freelance:   "FREELANCE",
};

const EXPERIENCE_LEVEL_MAP: Record<string, string> = {
  Junior:      "JUNIOR",
  "Mid-level": "MID",
  Senior:      "SENIOR",
  Lead:        "LEAD",
  Executive:   "EXECUTIVE",
};

export async function POST(req: NextRequest) {
  // Auth check
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
    return NextResponse.json({ error: "Employer account not found." }, { status: 404 });
  }

  let body: Record<string, string | number | boolean | null | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const {
    listingType,
    companyName,
    companyWebsite,
    companyDescription,
    jobTitle,
    category: categorySlug,
    experienceLevel,
    remoteType,
    employmentType,
    city,
    description,
    salaryDisclosed,
    salaryMin,
    salaryMax,
    applyType,
    applyUrl,
    applyEmail,
  } = body;

  const resolvedApplyType = ["URL", "EMAIL", "IN_APP"].includes(applyType as string) ? (applyType as string) : "URL";

  // Validate
  const errors: string[] = [];
  if (!listingType || !["standard", "featured"].includes(listingType as string)) errors.push("Invalid listing type.");
  if (!(companyName as string)?.trim()) errors.push("Company name is required.");
  if (!(jobTitle as string)?.trim()) errors.push("Job title is required.");
  if (!categorySlug) errors.push("Category is required.");
  if (!experienceLevel) errors.push("Experience level is required.");
  if (!remoteType) errors.push("Work type is required.");
  if (!employmentType) errors.push("Employment type is required.");
  if (!(description as string)?.trim()) errors.push("Job description is required.");
  if (resolvedApplyType === "URL"   && !(applyUrl   as string)?.trim()) errors.push("Application URL is required.");
  if (resolvedApplyType === "EMAIL" && !(applyEmail as string)?.trim()) errors.push("HR email address is required.");
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  // Check slot availability
  const needsFeatured = listingType === "featured";
  if (needsFeatured && employer.featuredSlots < 1) {
    return NextResponse.json({ error: "No featured listing slots available." }, { status: 402 });
  }
  if (!needsFeatured && employer.standardSlots < 1) {
    return NextResponse.json({ error: "No standard listing slots available." }, { status: 402 });
  }

  try {
    const categoryName = CATEGORY_NAMES[categorySlug as string] ?? (categorySlug as string);
    const category = await prisma.category.upsert({
      where:  { slug: categorySlug as string },
      create: { name: categoryName, slug: categorySlug as string },
      update: {},
    });

    const companySlug    = slugify((companyName as string).trim());
    const existingCo     = await prisma.company.findUnique({ where: { slug: companySlug } });
    const finalCoSlug    = existingCo ? existingCo.slug : companySlug;
    const company        = await prisma.company.upsert({
      where:  { slug: finalCoSlug },
      create: {
        name:        (companyName as string).trim(),
        slug:        finalCoSlug,
        website:     (companyWebsite as string | undefined)?.trim() || undefined,
        description: (companyDescription as string | undefined)?.trim() || undefined,
      },
      update: {},
    });

    // Link company to employer if not already linked
    if (!employer.companyId) {
      await prisma.employer.update({ where: { id: employer.id }, data: { companyId: company.id } });
    }

    const baseSlug   = slugify(`${(jobTitle as string).trim()}-${(companyName as string).trim()}`);
    const existingJob = await prisma.job.findUnique({ where: { slug: baseSlug } });
    const jobSlug    = existingJob ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

    const now       = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Atomic: deduct slot + create job
    const [, job] = await prisma.$transaction([
      prisma.employer.update({
        where: { id: employer.id },
        data: needsFeatured
          ? { featuredSlots: { decrement: 1 } }
          : { standardSlots: { decrement: 1 } },
      }),
      prisma.job.create({
        data: {
          slug:            jobSlug,
          title:           (jobTitle as string).trim(),
          description:     (description as string).trim(),
          status:          "ACTIVE",
          featured:        needsFeatured,
          postedAt:        now,
          expiresAt,
          companyId:       company.id,
          categoryId:      category.id,
          remoteType:      (REMOTE_TYPE_MAP[remoteType as string] ?? "ON_SITE") as never,
          employmentType:  (EMPLOYMENT_TYPE_MAP[employmentType as string] ?? "FULL_TIME") as never,
          experienceLevel: (EXPERIENCE_LEVEL_MAP[experienceLevel as string] ?? "MID") as never,
          city:            (city as string | undefined)?.trim() || undefined,
          salaryDisclosed: salaryDisclosed !== false,
          salaryMin:       salaryDisclosed !== false && salaryMin ? Number(salaryMin) : undefined,
          salaryMax:       salaryDisclosed !== false && salaryMax ? Number(salaryMax) : undefined,
          applyType:       resolvedApplyType,
          applyUrl:        resolvedApplyType === "URL"   ? (applyUrl   as string | undefined)?.trim() || undefined : undefined,
          applyEmail:      resolvedApplyType === "EMAIL" ? (applyEmail as string | undefined)?.trim() || undefined : undefined,
        },
      }),
    ]);

    // Link selected skill tags to the new job
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

    return NextResponse.json({ jobSlug: job.slug }, { status: 201 });
  } catch (err) {
    console.error("[jobs/post]", err);
    return NextResponse.json({ error: "Failed to post job. Please try again." }, { status: 500 });
  }
}
