import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const token = form.get("token");
  if (typeof token !== "string" || token.length < 16 || token.length > 128) return NextResponse.json({ error: "Invalid confirmation link." }, { status: 400 });
  const alert = await prisma.jobAlert.findUnique({ where: { token }, select: { id: true, confirmed: true, createdAt: true } });
  if (!alert || (!alert.confirmed && Date.now() - alert.createdAt.getTime() > 7 * 86400000)) {
    return NextResponse.json({ error: "This confirmation link is no longer valid. Please subscribe again." }, { status: 400 });
  }
  await prisma.jobAlert.update({ where: { id: alert.id }, data: { confirmed: true } });
  return NextResponse.redirect(new URL("/alerts/confirmed", req.url), 303);
}
