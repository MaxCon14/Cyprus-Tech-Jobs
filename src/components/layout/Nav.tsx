"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/jobs",         label: "Browse jobs" },
  { href: "/companies",    label: "Companies" },
  { href: "/salary-guide", label: "Salary guide" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              background: "var(--accent)",
              borderRadius: 6,
              display: "grid",
              placeItems: "center",
              color: "var(--white)",
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.02em",
              flexShrink: 0,
            }}
          >
            C
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            CyprusTech
            <span style={{ color: "var(--accent)" }}>.Jobs</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 400,
                textDecoration: "none",
                transition: "all 120ms cubic-bezier(0.16, 1, 0.3, 1)",
                color: pathname.startsWith(link.href) ? "var(--text)" : "var(--text-muted)",
                background: pathname.startsWith(link.href) ? "var(--bg-muted)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link href="/post-a-job" className="btn btn-primary btn-sm">
          Post a job
        </Link>
      </div>
    </header>
  );
}
