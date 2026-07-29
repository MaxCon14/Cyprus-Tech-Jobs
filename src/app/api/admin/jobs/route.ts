import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeJobHtml } from "@/lib/sanitize";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";
import { linkJobTags, parseTagNames } from "@/lib/job-tags";
import { UNKNOWN_CATEGORY_MESSAGE } from "@/lib/taxonomy";
import { notifyGoogle } from "@/lib/google-indexing";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function jobSlug(title: string) {
  return slugify(title) + "-" + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  if (!await getAdminUser()) return adminUnauthorized();

  const body = await req.json();
  const {
    title, description, companyName, categoryId, city,
    curatedCompanyLogoUrl,
    remoteType, employmentType, experienceLevel,
    salaryMin, salaryMax, salaryDisclosed,
    applyUrl, featured, status, tags: rawTags,
  } = body;

  if (!companyName?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  /* Confirm the category exists before writing. A missing or stale id used to
     fall through to a foreign-key violation and surface as an opaque 500. */
  if (!categoryId || !await prisma.category.findUnique({ where: { id: String(categoryId) } })) {
    return NextResponse.json({ error: UNKNOWN_CATEGORY_MESSAGE }, { status: 422 });
  }

  const job = await prisma.job.create({
    data: {
      slug:               jobSlug(title),
      title,
      description:        sanitizeJobHtml(description),
      isCurated:          true,
      curatedCompanyName: companyName.trim(),
      curatedCompanyLogoUrl: typeof curatedCompanyLogoUrl === "string" && curatedCompanyLogoUrl.trim() ? curatedCompanyLogoUrl.trim() : null,
      categoryId,
      city:               city || null,
      remoteType,
      employmentType,
      experienceLevel,
      salaryMin:          salaryMin ?? null,
      salaryMax:          salaryMax ?? null,
      salaryDisclosed:    salaryDisclosed ?? true,
      applyType:          "URL",
      applyUrl:           applyUrl || null,
      featured:           featured ?? false,
      status:             status ?? "ACTIVE",
      postedAt:           status === "ACTIVE" ? new Date() : null,
      expiresAt:          status === "ACTIVE" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
    },
  });

  // Link skill tags
  await linkJobTags(job.id, parseTagNames(rawTags));

  // Curated job published straight to ACTIVE → tell Google to crawl it now.
  if (job.status === "ACTIVE") after(() => notifyGoogle(job.slug, "URL_UPDATED"));

  return NextResponse.json(job);
}
