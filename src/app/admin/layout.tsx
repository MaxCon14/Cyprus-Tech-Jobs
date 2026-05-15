import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminNav from "./_components/AdminNav";

export const metadata = { title: "Admin — CyprusTech.Jobs" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminNav />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{
          height: 52, borderBottom: "1px solid var(--border)",
          background: "var(--surface)", display: "flex", alignItems: "center",
          padding: "0 28px", gap: 12,
        }}>
          <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 11 }}>
            Logged in as <strong style={{ color: "var(--text)" }}>{user.email}</strong>
          </span>
        </header>
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
