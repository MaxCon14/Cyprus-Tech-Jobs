import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function uniqueSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  let i = 2;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  if (!await getAdminUser()) return adminUnauthorized();
  const body = await req.json();
  const { title, excerpt, author, authorRole, category, tags, readTime, content, published } = body;
  const slug = await uniqueSlug(title);
  const post = await prisma.blogPost.create({
    data: {
      slug, title, excerpt,
      author: author ?? "CyprusTech.Careers Editorial",
      authorRole: authorRole ?? "Editorial",
      category, tags: tags ?? [],
      readTime: Number(readTime) || 5,
      content: content ?? [],
      published: published ?? true,
      publishedAt: new Date(),
    },
  });
  return NextResponse.json(post);
}
