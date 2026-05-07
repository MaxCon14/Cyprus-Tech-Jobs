import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, PRICE_IDS } from "@/lib/stripe";
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
  let body: Record<string, string | number | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const {
    plan,
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
    salaryMin,
    salaryMax,
    applyUrl,
    applyEmail,
  } = body;

  if (!plan || !PRICE_IDS[plan as keyof typeof PRICE_IDS]) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }
  if (!companyName || !(companyName as string).trim()) {
    return NextResponse.json({ error: "Company name is required." }, { status: 400 });
  }
  if (!jobTitle || !(jobTitle as string).trim()) {
    return NextResponse.json({ error: "Job title is required." }, { status: 400 });
  }
  if (!categorySlug) {
    return NextResponse.json({ error: "Category is required." }, { status: 400 });
  }
  if (!description || !(description as string).trim()) {
    return NextResponse.json({ error: "Job description is required." }, { status: 400 });
  }
  if (!applyUrl && !applyEmail) {
    return NextResponse.json({ error: "Application URL or email is required." }, { status: 400 });
  }

  try {
    const categoryName = CATEGORY_NAMES[categorySlug as string] ?? (categorySlug as string);
    const category = await prisma.category.upsert({
      where:  { slug: categorySlug as string },
      create: { name: categoryName, slug: categorySlug as string },
      update: {},
    });

    const companySlug = slugify((companyName as string).trim());
    const existingCompany = await prisma.company.findUnique({ where: { slug: companySlug } });
    const finalCompanySlug = existingCompany
      ? existingCompany.slug
      : companySlug;

    const company = await prisma.company.upsert({
      where:  { slug: finalCompanySlug },
      create: {
        name:        (companyName as string).trim(),
        slug:        finalCompanySlug,
        website:     (companyWebsite as string | undefined)?.trim() || undefined,
        description: (companyDescription as string | undefined)?.trim() || undefined,
      },
      update: {},
    });

    const baseSlug = slugify(`${(jobTitle as string).trim()}-${(companyName as string).trim()}`);
    const existingJob = await prisma.job.findUnique({ where: { slug: baseSlug } });
    const jobSlug = existingJob
      ? `${baseSlug}-${Date.now().toString(36).slice(-4)}`
      : baseSlug;

    const isFeatured = plan === "featured" || plan === "bundle";

    const job = await prisma.job.create({
      data: {
        slug:            jobSlug,
        title:           (jobTitle as string).trim(),
        description:     (description as string).trim(),
        status:          "DRAFT",
        featured:        isFeatured,
        companyId:       company.id,
        categoryId:      category.id,
        remoteType:      (REMOTE_TYPE_MAP[remoteType as string] ?? "ON_SITE") as never,
        employmentType:  (EMPLOYMENT_TYPE_MAP[employmentType as string] ?? "FULL_TIME") as never,
        experienceLevel: (EXPERIENCE_LEVEL_MAP[experienceLevel as string] ?? "MID") as never,
        city:            (city as string | undefined)?.trim() || undefined,
        salaryMin:       salaryMin ? Number(salaryMin) : undefined,
        salaryMax:       salaryMax ? Number(salaryMax) : undefined,
        applyUrl:        (applyUrl as string | undefined)?.trim() || undefined,
        applyEmail:      (applyEmail as string | undefined)?.trim() || undefined,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode:       "payment",
      line_items: [{ price: PRICE_IDS[plan as keyof typeof PRICE_IDS], quantity: 1 }],
      metadata:   { jobId: job.id },
      success_url:`${appUrl}/post-a-job/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/post-a-job`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
