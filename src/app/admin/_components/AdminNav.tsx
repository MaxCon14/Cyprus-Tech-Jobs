"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard",  label: "Dashboard",         icon: "◈" },
  { href: "/admin/jobs",       label: "Jobs",               icon: "◻" },
  { href: "/admin/users",      label: "Users",              icon: "◎" },
  { href: "/admin/companies",  label: "Companies",          icon: "⬡" },
  { href: "/admin/taxonomy",   label: "Categories & Tags",  icon: "◈" },
  { href: "/admin/analytics",  label: "Analytics",          icon: "△" },
  { href: "/admin/blog",       label: "Blog",               icon: "▤" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      width: 216, flexShrink: 0, minHeight: "100vh",
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh", overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10, letterSpacing: "0.12em", marginBottom: 4 }}>ADMIN PANEL</div>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14 }}>CyprusTech.Careers</div>
      </div>

      <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 8 }} />

      {/* Links */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px" }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              borderRadius: 7, textDecoration: "none", fontSize: 13,
              fontFamily: "var(--font-sans)", fontWeight: active ? 600 : 400,
              background: active ? "var(--accent-soft)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-muted)",
              transition: "background 120ms, color 120ms",
            }}>
              <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", opacity: 0.7 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
        <Link href="/" className="mono-s" style={{ color: "var(--text-subtle)", textDecoration: "none", fontSize: 11 }}>
          ← Back to site
        </Link>
      </div>
    </nav>
  );
}
