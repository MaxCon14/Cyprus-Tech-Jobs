"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut, LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const supabase = createSupabaseBrowserClient();

const navLinks = [
  { href: "/jobs",         label: "Browse jobs" },
  { href: "/companies",    label: "Companies" },
  { href: "/salary-guide", label: "Salary guide" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 6, display: "grid", placeItems: "center", color: "var(--white)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-sans)", letterSpacing: "-0.02em", flexShrink: 0 }}>
            C
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", color: "var(--text)" }}>
            CyprusTech<span style={{ color: "var(--accent)" }}>.Jobs</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{ padding: "6px 12px", borderRadius: 6, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 400, textDecoration: "none", transition: "all 120ms cubic-bezier(0.16, 1, 0.3, 1)", color: pathname.startsWith(link.href) ? "var(--text)" : "var(--text-muted)", background: pathname.startsWith(link.href) ? "var(--bg-muted)" : "transparent" }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth area */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!loading && user ? (
            <>
              <Link href="/employers/dashboard" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <LayoutDashboard size={13} /> Dashboard
              </Link>
              <button onClick={handleSignOut} className="btn btn-ghost btn-sm" title="Sign out" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
                <LogOut size={13} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/employers/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link href="/get-started" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
