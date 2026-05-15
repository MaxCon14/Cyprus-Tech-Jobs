import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function jobSlug(title: string) {
  return slugify(title) + "-" + Date.now().toString(36);
}

async function resolveCompany(companyName: string): Promise<string> {
  const slug = slugify(companyName);
  const existing = await prisma.company.findUnique({ where: { slug } });
  if (existing) return existing.id;
  const created = await prisma.company.create({
    data: { name: companyName, slug },
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
    applyUrl, featured, status,
  } = body;

  if (!companyName?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const companyId = await resolveCompany(companyName.trim());

  const job = await prisma.job.create({
    data: {
      slug:           jobSlug(title),
      title,
      description,
      companyId,
      categoryId,
      city:           city || null,
      remoteType,
      employmentType,
      experienceLevel,
      salaryMin:      salaryMin ?? null,
      salaryMax:      salaryMax ?? null,
      salaryDisclosed: salaryDisclosed ?? true,
      applyType:      "URL",
      applyUrl:       applyUrl || null,
      featured:       featured ?? false,
      status:         status ?? "ACTIVE",
      postedAt:       status === "ACTIVE" ? new Date() : null,
      expiresAt:      status === "ACTIVE" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
    },
  });

  return NextResponse.json(job);
}
