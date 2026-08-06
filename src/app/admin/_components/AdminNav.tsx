"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();

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
  const router   = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  /* Below 768px the nav in globals.css becomes an off-canvas drawer that this
     state opens/closes; above 768px `.admin-nav`/`.is-open` are inert and
     `open` never affects anything (the CSS never applies), so no separate
     desktop/mobile branch is needed here. */
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes — otherwise it stays open
  // over the new page after tapping a link.
  useEffect(() => { setOpen(false); }, [pathname]);

  /* Straight to /admin/login rather than the homepage: signing out of the
     admin panel means you want back in, not out to the public site. */
  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="admin-nav-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div
        className={`admin-nav-backdrop${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Width/position/height live in the .admin-nav CSS class, not here —
          an inline style would out-specificity the mobile media query below
          768px and the drawer would never actually narrow or slide in. */}
      <nav className={`admin-nav${open ? " is-open" : ""}`} style={{
        flexShrink: 0, minHeight: "100vh",
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
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
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/" className="mono-s" style={{ color: "var(--text-subtle)", textDecoration: "none", fontSize: 11 }}>
            ← Back to site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 12px", marginLeft: -12,
              background: "none", border: "none", borderRadius: 7,
              cursor: signingOut ? "default" : "pointer",
              fontFamily: "var(--font-sans)", fontSize: 13,
              color: signingOut ? "var(--text-subtle)" : "var(--text-muted)",
              transition: "background 120ms, color 120ms",
            }}
          >
            <LogOut size={14} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </nav>
    </>
  );
}
