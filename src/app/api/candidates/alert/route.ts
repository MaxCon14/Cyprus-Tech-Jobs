import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAlertConfirmation } from "@/lib/email";
import type { ExperienceLevel, RemoteType } from "@prisma/client";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 422 });
  }

  const categoryId      = typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null;
  const remoteType      = typeof body.remoteType === "string" && body.remoteType ? (body.remoteType as RemoteType) : null;
  const city            = typeof body.city === "string" && body.city ? body.city : null;
  const firstName       = typeof body.firstName === "string" ? body.firstName.trim() : null;
  const experienceLevel = typeof body.experienceLevel === "string" && body.experienceLevel
    ? (body.experienceLevel as ExperienceLevel) : null;
  const salaryMin       = typeof body.salaryMin === "number" ? body.salaryMin : null;
  const alertFrequency  = body.alertFrequency === "DAILY" ? "DAILY" : "WEEKLY";

  try {
    const alert = await prisma.jobAlert.upsert({
      where: {
        email_categoryId_remoteType: {
          email,
          categoryId: categoryId ?? "",
          remoteType: remoteType as RemoteType,
        },
      },
      create: {
        email,
        firstName,
        categoryId,
        remoteType,
        city,
        experienceLevel,
        salaryMin,
        alertFrequency,
        confirmed: true,
      },
      update: {
        city,
        experienceLevel,
        salaryMin,
        alertFrequency,
        confirmed: true,
      },
    });

    // Look up category name for email display
    let categoryName: string | null = null;
    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: categoryId }, select: { name: true } });
      categoryName = cat?.name ?? null;
    }

    // Count jobs matching these filters for email
    const currentJobCount = await prisma.job.count({
      where: {
        status: "ACTIVE",
        ...(categoryId      && { categoryId }),
        ...(remoteType      && { remoteType }),
        ...(city            && { city: { contains: city, mode: "insensitive" } }),
        ...(experienceLevel && { experienceLevel }),
      },
    });

    // Send confirmation email (non-blocking — don't fail the request if email fails)
    sendAlertConfirmation(email, {
      categoryName,
      remoteType,
      city,
      experienceLevel,
      alertFrequency,
      currentJobCount,
    }, alert.token).catch(err => console.error("[alert confirmation email]", err));

    return NextResponse.json({ alertId: alert.id }, { status: 201 });
  } catch (err) {
    console.error("[candidates/alert]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
