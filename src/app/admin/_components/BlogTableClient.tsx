"use client";
import { useState } from "react";
import Link from "next/link";
import { AdminTable, AdminTr, AdminTd, StatusBadge } from "./AdminTable";
import { AdminSearchInput } from "./AdminSearchInput";
import { RowActions } from "./RowActions";
import { Pagination, PAGE_SIZE } from "./Pagination";
import { EmptyState } from "./AdminUI";
type Post = { id: string; title: string; slug: string; category: string; author: string; published: boolean; publishedAt: string };
export function BlogTableClient({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const results = posts.filter(p => (filter === "all" || p.published === (filter === "published")) && `${p.title} ${p.category} ${p.author}`.toLowerCase().includes(query.trim().toLowerCase()));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(results.length / PAGE_SIZE)));
  return <section className="adm-panel adm-management"><div className="adm-tabs" aria-label="Filter blog posts">{["all", "published", "drafts"].map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => { setFilter(f); setPage(1); }}>{f === "all" ? "All posts" : f === "published" ? "Published" : "Drafts"}<span>{f === "all" ? posts.length : posts.filter(p => p.published === (f === "published")).length}</span></button>)}</div><div className="adm-toolbar"><AdminSearchInput placeholder="Search posts, categories or authors…" value={query} onChange={v => { setQuery(v); setPage(1); }} /></div>
    <AdminTable columns={["Article", "Category", "Author", "Publication date", "Status", "Actions"]}>{results.length ? results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map(p => <AdminTr key={p.id}><AdminTd><Link href={`/admin/blog/${p.id}/edit`} className="adm-job-name">{p.title}</Link><small className="adm-cell-subtitle">{p.slug}</small></AdminTd><AdminTd subtle>{p.category}</AdminTd><AdminTd subtle>{p.author}</AdminTd><AdminTd subtle>{p.published ? new Date(p.publishedAt).toLocaleDateString("en-GB", { timeZone: "UTC" }) : "Not published"}</AdminTd><AdminTd><StatusBadge status={p.published ? "LIVE" : "DRAFT"} /></AdminTd><AdminTd><Link href={`/admin/blog/${p.id}/edit`} className="adm-edit-link">Edit article</Link><RowActions actions={[{ label: p.published ? "Unpublish" : "Publish", endpoint: `/api/admin/blog/${p.id}`, method: "PATCH", body: { published: !p.published }, confirm: `${p.published ? "Unpublish" : "Publish"} "${p.title}"?` }, { label: "Delete", endpoint: `/api/admin/blog/${p.id}`, method: "DELETE", confirm: `Permanently delete "${p.title}"? This cannot be undone.`, destructive: true }]} /></AdminTd></AdminTr>) : <tr><td colSpan={6}><EmptyState title="No articles found" description={posts.length ? "Try another search or status filter." : "Write your first article to share with your community."} /></td></tr>}</AdminTable><Pagination total={results.length} page={currentPage} onChange={setPage} /></section>;
}
