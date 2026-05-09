import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ExperienceLevel, RemoteType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email     = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const companyId = searchParams.get("companyId") ?? null;

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const alert = await prisma.jobAlert.findFirst({
    where: {
      email,
      companyId: companyId ?? null,
    },
    select: { alertFrequency: true },
  });

  return NextResponse.json({
    subscribed:     !!alert,
    alertFrequency: alert?.alertFrequency ?? null,
  });
}

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

  const categoryId      = typeof body.categoryId === "string" ? body.categoryId : null;
  const companyId       = typeof body.companyId  === "string" ? body.companyId  : null;
  const remoteType      = typeof body.remoteType === "string" ? (body.remoteType as RemoteType) : null;
  const city            = typeof body.city === "string" && body.city ? body.city : null;
  const firstName       = typeof body.firstName === "string" ? body.firstName.trim() : null;
  const experienceLevel =
    typeof body.experienceLevel === "string" ? (body.experienceLevel as ExperienceLevel) : null;
  const salaryMin       = typeof body.salaryMin === "number" ? body.salaryMin : null;
  const alertFrequency  = body.alertFrequency === "DAILY" ? "DAILY" : "WEEKLY";

  try {
    const alert = await prisma.jobAlert.upsert({
      where: {
        email_categoryId_remoteType_companyId: {
          email,
          categoryId: categoryId ?? "",
          remoteType: remoteType as RemoteType,
          companyId:  companyId ?? "",
        },
      },
      create: {
        email,
        firstName,
        categoryId,
        companyId,
        remoteType,
        city,
        experienceLevel,
        salaryMin,
        alertFrequency,
        confirmed: true,
      },
      update: {
        alertFrequency,
        confirmed: true,
      },
    });

    return NextResponse.json({ alertId: alert.id }, { status: 201 });
  } catch (err) {
    console.error("[candidates/alert POST]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // ID-based delete (from dashboard — no email required, auth verified server-side)
  if (typeof body.alertId === "string" && body.alertId) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      await prisma.jobAlert.deleteMany({
        where: { id: body.alertId, email: user.email.toLowerCase() },
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[candidates/alert DELETE by id]", err);
      return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
  }

  // Email-based delete (from FollowCompanyButton — no session required)
  const email     = typeof body.email     === "string" ? body.email.trim().toLowerCase() : "";
  const companyId = typeof body.companyId === "string" ? body.companyId : null;

  if (!email) {
    return NextResponse.json({ error: "email or alertId is required." }, { status: 422 });
  }

  try {
    await prisma.jobAlert.deleteMany({
      where: { email, companyId: companyId ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[candidates/alert DELETE]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
