import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function validateBody(body: Record<string, unknown>): string | null {
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) return "Name is required.";
  if (!body.email || typeof body.email !== "string") return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email as string)) return "Invalid email address.";
  if (!body.companyName || typeof body.companyName !== "string" || !body.companyName.trim()) return "Company name is required.";
  return null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validationError = validateBody(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 422 });

  const name        = (body.name as string).trim();
  const email       = (body.email as string).trim().toLowerCase();
  const companyName = (body.companyName as string).trim();
  const website     = typeof body.website === "string" ? body.website.trim() : undefined;
  const city        = typeof body.city === "string" ? body.city.trim() : undefined;
  const size        = typeof body.size === "string" ? body.size : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : undefined;
  const techStack   = Array.isArray(body.techStack) ? (body.techStack as string[]) : [];

  try {
    const existing = await prisma.employer.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ employerId: existing.id, exists: true }, { status: 200 });

    const baseSlug = slugify(companyName);
    const existingCompany = await prisma.company.findUnique({ where: { slug: baseSlug } });
    const slug = existingCompany ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

    const company = await prisma.company.upsert({
      where: { slug },
      create: { name: companyName, slug, website, city, size, description, techStack },
      update: {
        description: description ?? undefined,
        techStack: techStack.length > 0 ? techStack : undefined,
        website: website ?? undefined,
        city: city ?? undefined,
        size: size ?? undefined,
      },
    });

    const employer = await prisma.employer.create({
      data: { email, name, companyId: company.id },
    });

    return NextResponse.json({ employerId: employer.id }, { status: 201 });
  } catch (err) {
    console.error("[employers/onboarding]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
