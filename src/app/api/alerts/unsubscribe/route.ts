import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const alert = await prisma.jobAlert.findUnique({ where: { token }, select: { id: true } });
  if (!alert) return NextResponse.json({ error: "Subscription not found." }, { status: 404 });

  await prisma.jobAlert.delete({ where: { token } });
  return NextResponse.json({ ok: true });
}
