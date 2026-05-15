import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function resolveCompany(companyName: string): Promise<string> {
  const slug = slugify(companyName);
  const existing = await prisma.company.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const created = await prisma.company.create({ data: { name: companyName, slug } });
  return created.id;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  const body = await req.json();
  const { title, description, companyName, categoryId, city, remoteType, employmentType,
    experienceLevel, salaryMin, salaryMax, salaryDisclosed, applyUrl,
    featured, status, tags: rawTags } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined)          data.title = title;
  if (description !== undefined)    data.description = description;
  if (companyName !== undefined)    data.companyId = await resolveCompany(companyName.trim());
  if (categoryId !== undefined)     data.categoryId = categoryId;
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
    const tagNames: string[] = (() => {
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
  }

  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
