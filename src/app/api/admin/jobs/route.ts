import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function jobSlug(title: string) {
  return slugify(title) + "-" + Date.now().toString(36);
}

async function getCuratedCompanyId(): Promise<string> {
  const existing = await prisma.company.findUnique({ where: { slug: "curated" } });
  if (existing) return existing.id;
  const created = await prisma.company.create({
    data: { name: "CyprusTech.Jobs", slug: "curated" },
  });
  return created.id;
}

export async function POST(req: NextRequest) {
  if (!await getAdminUser()) return adminUnauthorized();

  const body = await req.json();
  const {
    title, description, companyName, categoryId, city,
    remoteType, employmentType, experienceLevel,
    salaryMin, salaryMax, salaryDisclosed,
    applyUrl, featured, status, tags: rawTags,
  } = body;

  if (!companyName?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const companyId = await getCuratedCompanyId();

  const job = await prisma.job.create({
    data: {
      slug:               jobSlug(title),
      title,
      description,
      companyId,
      isCurated:          true,
      curatedCompanyName: companyName.trim(),
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
  const tagNames: string[] = (() => {
    try { return JSON.parse(rawTags as string) as string[]; } catch { return []; }
  })();
  if (tagNames.length > 0) {
    const tagRecords = await prisma.tag.findMany({ where: { name: { in: tagNames } } });
    await prisma.jobTag.createMany({
      data: tagRecords.map(t => ({ jobId: job.id, tagId: t.id })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(job);
}
