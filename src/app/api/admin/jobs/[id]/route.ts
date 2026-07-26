import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";
import { linkJobTags, parseTagNames } from "@/lib/job-tags";
import { UNKNOWN_CATEGORY_MESSAGE } from "@/lib/taxonomy";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  const body = await req.json();
  const { title, description, companyName, curatedCompanyLogoUrl, categoryId, city,
    remoteType, employmentType,
    experienceLevel, salaryMin, salaryMax, salaryDisclosed, applyUrl,
    featured, status, tags: rawTags } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined)          data.title = title;
  if (description !== undefined)    data.description = description;
  if (companyName !== undefined)    data.curatedCompanyName = companyName.trim();
  if (curatedCompanyLogoUrl !== undefined) data.curatedCompanyLogoUrl = typeof curatedCompanyLogoUrl === "string" && curatedCompanyLogoUrl.trim() ? curatedCompanyLogoUrl.trim() : null;
  if (categoryId !== undefined) {
    /* Confirm the category exists rather than letting a stale id fall through
       to a foreign-key violation and an opaque 500. */
    if (!await prisma.category.findUnique({ where: { id: String(categoryId) } })) {
      return NextResponse.json({ error: UNKNOWN_CATEGORY_MESSAGE }, { status: 422 });
    }
    data.categoryId = categoryId;
  }
  if (city !== undefined)           data.city = city || null;
  if (remoteType !== undefined)     data.remoteType = remoteType;
  if (employmentType !== undefined) data.employmentType = employmentType;
  if (experienceLevel !== undefined)data.experienceLevel = experienceLevel;
  if (salaryMin !== undefined)      data.salaryMin = salaryMin ?? null;
  if (salaryMax !== undefined)      data.salaryMax = salaryMax ?? null;
  if (salaryDisclosed !== undefined) data.salaryDisclosed = salaryDisclosed;
  if (applyUrl !== undefined)        data.applyUrl = applyUrl || null;
  if (featured !== undefined)       data.featured = featured;
  if (status !== undefined) {
    data.status = status;
    if (status === "ACTIVE") {
      data.postedAt = data.postedAt ?? new Date();
      data.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  const job = await prisma.job.update({ where: { id }, data });

  // Replace skill tags if provided
  if (rawTags !== undefined) {
    await prisma.jobTag.deleteMany({ where: { jobId: id } });
    await linkJobTags(id, parseTagNames(rawTags));
  }

  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
