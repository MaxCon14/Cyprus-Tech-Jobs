import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "../_components/AdminTable";
import { RowActions } from "../_components/RowActions";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Blog</h1>
          <p className="body-s" style={{ color: "var(--text-subtle)" }}>{posts.length} posts</p>
        </div>
        <Link href="/admin/blog/new" className="btn btn-accent" style={{ fontSize: 13 }}>+ New post</Link>
      </div>

      <AdminTable columns={["Title", "Category", "Author", "Published", "Status", "Actions"]}>
        {posts.map(p => (
          <AdminTr key={p.id}>
            <AdminTd>
              <div style={{ fontWeight: 600, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
              <div className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>{p.slug}</div>
            </AdminTd>
            <AdminTd subtle>{p.category}</AdminTd>
            <AdminTd subtle>{p.author}</AdminTd>
            <AdminTd mono subtle>{new Date(p.publishedAt).toLocaleDateString("en-GB")}</AdminTd>
            <AdminTd><StatusBadge status={p.published ? "LIVE" : "DRAFT"} /></AdminTd>
            <AdminTd>
              <RowActions actions={[
                p.published
                  ? { label: "Unpublish", endpoint: `/api/admin/blog/${p.id}`, method: "PATCH", body: { published: false } }
                  : { label: "Publish",   endpoint: `/api/admin/blog/${p.id}`, method: "PATCH", body: { published: true } },
                { label: "Delete", endpoint: `/api/admin/blog/${p.id}`, method: "DELETE", confirm: `Delete "${p.title}"?`, destructive: true },
              ]} />
              <Link href={`/admin/blog/${p.id}/edit`} style={{ display: "inline-block", marginTop: 4, fontSize: 11, color: "var(--text-subtle)", textDecoration: "none" }}>Edit →</Link>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>
    </div>
  );
}
