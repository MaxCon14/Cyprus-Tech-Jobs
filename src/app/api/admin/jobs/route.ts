import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
    "-" + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  if (!await getAdminUser()) return adminUnauthorized();
  const body = await req.json();
  const { title, description, companyId, categoryId, city, remoteType, employmentType,
    experienceLevel, salaryMin, salaryMax, salaryDisclosed, applyType, applyUrl, applyEmail,
    featured, status } = body;

  const job = await prisma.job.create({
    data: {
      slug: slugify(title),
      title, description, companyId, categoryId,
      city: city || null, remoteType, employmentType, experienceLevel,
      salaryMin: salaryMin ?? null, salaryMax: salaryMax ?? null,
      salaryDisclosed: salaryDisclosed ?? true,
      applyType: applyType ?? "URL",
      applyUrl: applyUrl || null, applyEmail: applyEmail || null,
      featured: featured ?? false,
      status: status ?? "ACTIVE",
      postedAt: status === "ACTIVE" ? new Date() : null,
      expiresAt: status === "ACTIVE" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
    },
  });
  return NextResponse.json(job);
}
