import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function sendLoginEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@cyprustechjobs.com";
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const loginUrl = `${baseUrl}/employers/login?token=${token}`;

  if (!apiKey) {
    console.log(`[magic-link] Sign-in link for ${email}: ${loginUrl}`);
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Your CyprusTech.Jobs sign-in link",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
          <h1 style="font-size:24px;font-weight:700;color:#0A0A0A;margin-bottom:8px;">
            Sign in to CyprusTech.Jobs
          </h1>
          <p style="color:#525252;font-size:15px;line-height:1.6;margin-bottom:24px;">
            Click the button below to sign in to your employer account. This link expires in 1 hour.
          </p>
          <a href="${loginUrl}"
             style="display:inline-block;background:#FF3D7F;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
            Sign in →
          </a>
          <p style="color:#A3A3A3;font-size:13px;margin-top:24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 422 });
  }

  const employer = await prisma.employer.findUnique({ where: { email } });

  // Always return ok — prevents email enumeration
  if (!employer || !employer.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const loginToken = crypto.randomUUID();
  const loginTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.employer.update({
    where: { id: employer.id },
    data: { loginToken, loginTokenExpiry },
  });

  sendLoginEmail(email, loginToken).catch(console.error);

  return NextResponse.json({ ok: true });
}
