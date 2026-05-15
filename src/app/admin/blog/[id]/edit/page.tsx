import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminBlogForm } from "../../../_components/AdminBlogForm";

export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        Edit — <span style={{ color: "var(--text-muted)" }}>{post.title}</span>
      </h1>
      <AdminBlogForm
        postId={id}
        initial={{
          meta: {
            title: post.title,
            excerpt: post.excerpt,
            author: post.author,
            authorRole: post.authorRole,
            category: post.category,
            tags: post.tags.join(", "),
            readTime: post.readTime.toString(),
            published: post.published,
          },
          sections: (post.content as unknown as Array<{ type: "h2"|"h3"|"paragraph"|"list"|"callout"|"quote"; text?: string; items?: string[]; variant?: string }>) ?? [],
        }}
      />
    </div>
  );
}
