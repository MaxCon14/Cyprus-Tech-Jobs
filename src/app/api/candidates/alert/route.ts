import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  const categoryId     = typeof body.categoryId === "string" ? body.categoryId : null;
  const remoteType     = typeof body.remoteType === "string" ? (body.remoteType as RemoteType) : null;
  const city           = typeof body.city === "string" && body.city ? body.city : null;
  const firstName      = typeof body.firstName === "string" ? body.firstName.trim() : null;
  const experienceLevel =
    typeof body.experienceLevel === "string" ? (body.experienceLevel as ExperienceLevel) : null;
  const salaryMin = typeof body.salaryMin === "number" ? body.salaryMin : null;
  const alertFrequency =
    body.alertFrequency === "DAILY" ? "DAILY" : "WEEKLY";

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
      },
      update: {},
    });

    return NextResponse.json({ alertId: alert.id }, { status: 201 });
  } catch (err) {
    console.error("[candidates/alert]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
