import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const cats = await prisma.category.findMany({
    include: { _count: { select: { jobs: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { name } = await req.json();
  const cat = await prisma.category.create({ data: { name, slug: slugify(name) } });
  return NextResponse.json(cat);
}
