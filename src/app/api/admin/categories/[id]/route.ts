import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";
import { CATEGORY_CACHE_TAG } from "@/lib/taxonomy";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;

  const cat = await prisma.category.findUnique({
    where:   { id },
    include: { _count: { select: { jobs: true, children: true } } },
  });
  if (!cat) return NextResponse.json({ error: "Category not found." }, { status: 404 });

  /* Deleting a category with jobs would fail on the foreign key anyway; say so
     plainly instead of returning a 500. */
  if (cat._count.jobs > 0) {
    return NextResponse.json(
      { error: `${cat.name} still has ${cat._count.jobs} job${cat._count.jobs === 1 ? "" : "s"}. Move them first.` },
      { status: 409 },
    );
  }

  /* Children survive their parent with parentId set to null, which quietly
     promotes every subcategory to a top-level entry in the nav. */
  if (cat._count.children > 0) {
    return NextResponse.json(
      { error: `${cat.name} has ${cat._count.children} subcategor${cat._count.children === 1 ? "y" : "ies"}. Delete those first.` },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidateTag(CATEGORY_CACHE_TAG, "max");
  return NextResponse.json({ ok: true });
}
