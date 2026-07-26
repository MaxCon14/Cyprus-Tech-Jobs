import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";
import { CATEGORY_CACHE_TAG } from "@/lib/taxonomy";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const cats = await prisma.category.findMany({
    include: { _count: { select: { jobs: true, children: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  if (!await getAdminUser()) return adminUnauthorized();

  const { name, parentId } = await req.json();
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return NextResponse.json({ error: "Name is required." }, { status: 422 });

  const slug = slugify(trimmed);
  if (!slug) return NextResponse.json({ error: "That name has no usable letters or digits." }, { status: 422 });

  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash) {
    return NextResponse.json(
      { error: `"${clash.name}" already uses the slug ${slug}.` },
      { status: 409 },
    );
  }

  /* The taxonomy is exactly two levels deep — /jobs?category=<slug> matches a
     category and its direct children, so a grandchild's jobs would show under
     the grandchild alone and be missing from the parent everything links to. */
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: String(parentId) } });
    if (!parent)          return NextResponse.json({ error: "That parent category no longer exists." }, { status: 422 });
    if (parent.parentId)  return NextResponse.json({ error: "Subcategories cannot be nested further." }, { status: 422 });
  }

  const cat = await prisma.category.create({
    data: { name: trimmed, slug, parentId: parentId ? String(parentId) : null },
  });
  revalidateTag(CATEGORY_CACHE_TAG, "max");
  return NextResponse.json(cat, { status: 201 });
}
