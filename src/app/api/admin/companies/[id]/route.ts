import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.verified !== undefined) data.verified = body.verified;
  if (body.featured !== undefined) data.featured = body.featured;
  const company = await prisma.company.update({ where: { id }, data });
  return NextResponse.json(company);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  // Jobs cascade-delete via FK if set, otherwise delete manually first
  await prisma.job.deleteMany({ where: { companyId: id } });
  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
