import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/employers/onboarding/verify?error=missing", req.url));
  }

  try {
    const employer = await prisma.employer.findUnique({
      where: { verifyToken: token },
    });

    if (!employer) {
      return NextResponse.redirect(new URL("/employers/onboarding/verify?error=invalid", req.url));
    }

    if (employer.verifyTokenExpiry && employer.verifyTokenExpiry < new Date()) {
      return NextResponse.redirect(new URL("/employers/onboarding/verify?error=expired", req.url));
    }

    // Generate a one-time login token so the employer is signed in immediately
    const loginToken = crypto.randomUUID();
    const loginTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.employer.update({
      where: { id: employer.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
        onboardingCompleted: true,
        loginToken,
        loginTokenExpiry,
      },
    });

    // Login page consumes the token, creates a session, and redirects to dashboard
    return NextResponse.redirect(
      new URL(`/employers/login?token=${loginToken}`, req.url)
    );
  } catch (err) {
    console.error("[employers/verify]", err);
    return NextResponse.redirect(new URL("/employers/onboarding/verify?error=server", req.url));
  }
}
