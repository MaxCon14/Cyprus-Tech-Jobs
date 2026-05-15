import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  const fields = ["title", "excerpt", "author", "authorRole", "category", "tags",
    "readTime", "content", "published"] as const;
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  if (body.readTime !== undefined) data.readTime = Number(body.readTime);
  const post = await prisma.blogPost.update({ where: { id }, data });
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
