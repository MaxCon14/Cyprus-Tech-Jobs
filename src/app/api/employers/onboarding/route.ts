import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function validateBody(body: Record<string, unknown>): string | null {
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return "Name is required.";
  }
  if (!body.email || typeof body.email !== "string") {
    return "Email is required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email as string)) {
    return "Invalid email address.";
  }
  if (!body.companyName || typeof body.companyName !== "string" || !body.companyName.trim()) {
    return "Company name is required.";
  }
  return null;
}

async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@cyprustechjobs.com";
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  if (!apiKey || apiKey === "your_resend_api_key") return; // skip in dev without real key

  const verifyUrl = `${baseUrl}/api/employers/verify?token=${token}`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Verify your CyprusTech.Jobs employer account",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
          <h1 style="font-size:24px;font-weight:700;color:#0A0A0A;margin-bottom:8px;">
            Hi ${name} 👋
          </h1>
          <p style="color:#525252;font-size:15px;line-height:1.6;margin-bottom:24px;">
            Thanks for creating your employer account on CyprusTech.Jobs.
            Click below to verify your email and activate your profile.
          </p>
          <a href="${verifyUrl}"
             style="display:inline-block;background:#FF3D7F;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
            Verify my email →
          </a>
          <p style="color:#A3A3A3;font-size:13px;margin-top:24px;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validationError = validateBody(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  const name        = (body.name as string).trim();
  const email       = (body.email as string).trim().toLowerCase();
  const companyName = (body.companyName as string).trim();
  const website     = typeof body.website === "string" ? body.website.trim() : undefined;
  const city        = typeof body.city === "string" ? body.city.trim() : undefined;
  const size        = typeof body.size === "string" ? body.size : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : undefined;
  const techStack   = Array.isArray(body.techStack) ? (body.techStack as string[]) : [];

  try {
    // Check if employer already exists
    const existing = await prisma.employer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ employerId: existing.id, exists: true }, { status: 200 });
    }

    // Upsert company (by slug — handles duplicate company names gracefully)
    const baseSlug = slugify(companyName);
    const existingCompany = await prisma.company.findUnique({ where: { slug: baseSlug } });
    const slug = existingCompany
      ? `${baseSlug}-${Date.now().toString(36).slice(-4)}`
      : baseSlug;

    const company = await prisma.company.upsert({
      where: { slug },
      create: {
        name: companyName,
        slug,
        website,
        city,
        size,
        description,
        techStack,
      },
      update: {
        description: description ?? undefined,
        techStack: techStack.length > 0 ? techStack : undefined,
        website: website ?? undefined,
        city: city ?? undefined,
        size: size ?? undefined,
      },
    });

    // Create employer with verification token
    const verifyToken = crypto.randomUUID();
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const employer = await prisma.employer.create({
      data: {
        email,
        name,
        companyId: company.id,
        verifyToken,
        verifyTokenExpiry,
      },
    });

    // Send verification email (fire and forget — don't fail the response if email fails)
    sendVerificationEmail(email, name, verifyToken).catch(console.error);

    return NextResponse.json({ employerId: employer.id }, { status: 201 });
  } catch (err) {
    console.error("[employers/onboarding]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
