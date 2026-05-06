import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ExperienceLevel, RemoteType } from "@prisma/client";

// GET /api/alerts/manage?token=...
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const alert = await prisma.jobAlert.findUnique({ where: { token } });
  if (!alert) return NextResponse.json({ error: "Subscription not found." }, { status: 404 });

  let categoryName: string | null = null;
  if (alert.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: alert.categoryId }, select: { name: true } });
    categoryName = cat?.name ?? null;
  }

  return NextResponse.json({
    id:              alert.id,
    email:           alert.email,
    categoryId:      alert.categoryId,
    categoryName,
    remoteType:      alert.remoteType,
    city:            alert.city,
    experienceLevel: alert.experienceLevel,
    alertFrequency:  alert.alertFrequency,
    createdAt:       alert.createdAt,
  });
}

// PATCH /api/alerts/manage — update preferences
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const alert = await prisma.jobAlert.findUnique({ where: { token }, select: { id: true } });
  if (!alert) return NextResponse.json({ error: "Subscription not found." }, { status: 404 });

  const categoryId      = typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null;
  const remoteType      = typeof body.remoteType === "string" && body.remoteType ? (body.remoteType as RemoteType) : null;
  const city            = typeof body.city === "string" && body.city ? body.city : null;
  const experienceLevel = typeof body.experienceLevel === "string" && body.experienceLevel
    ? (body.experienceLevel as ExperienceLevel) : null;
  const alertFrequency  = body.alertFrequency === "DAILY" ? "DAILY" : "WEEKLY";

  await prisma.jobAlert.update({
    where: { token },
    data: { categoryId, remoteType, city, experienceLevel, alertFrequency },
  });

  return NextResponse.json({ ok: true });
}
