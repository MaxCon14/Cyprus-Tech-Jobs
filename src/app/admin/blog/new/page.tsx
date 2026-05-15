import { AdminBlogForm } from "../../_components/AdminBlogForm";

export default function AdminBlogNewPage() {
  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>New blog post</h1>
      <AdminBlogForm />
    </div>
  );
}
