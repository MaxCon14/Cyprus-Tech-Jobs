import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeading } from "../_components/AdminUI";
import { BlogTableClient } from "../_components/BlogTableClient";
export const dynamic = "force-dynamic";
export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return <div><PageHeading eyebrow="Editorial hub" title="Blog posts" description="Create, organise, and publish stories for the Cyprus tech community." actions={<Link href="/admin/blog/new" className="adm-button adm-button-primary"><Plus size={16} /> New article</Link>} /><BlogTableClient posts={posts.map(p => ({ id: p.id, title: p.title, slug: p.slug, author: p.author, category: p.category, published: p.published, publishedAt: p.publishedAt.toISOString() }))} /></div>;
}
