"use client";

import Link from "next/link";
import { Briefcase, Search } from "lucide-react";
import type { Metadata } from "next";

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "calc(100vh - 61px)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "clamp(24px, 5vw, 48px) var(--page-padding-x)",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px", color: "var(--text)" }}>
              CyprusTech<span style={{ color: "var(--accent)" }}>.Jobs</span>
            </span>
          </Link>
          <p className="body-s" style={{ color: "var(--text-subtle)", marginTop: 8 }}>
            Choose how you&apos;re signing in
          </p>
        </div>

        {/* Choice cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <Link href="/candidates/login" style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14,
              padding: "22px 24px", cursor: "pointer", transition: "all 150ms ease",
              display: "flex", alignItems: "center", gap: 18,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface)";
            }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Search size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
                  I&apos;m looking for a job
                </p>
                <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>
                  Sign in to your candidate account
                </p>
              </div>
            </div>
          </Link>

          <Link href="/employers/login" style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14,
              padding: "22px 24px", cursor: "pointer", transition: "all 150ms ease",
              display: "flex", alignItems: "center", gap: 18,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface)";
            }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--bg-muted)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Briefcase size={20} style={{ color: "var(--text-muted)" }} />
              </div>
              <div>
                <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
                  I&apos;m hiring
                </p>
                <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>
                  Sign in to your employer account
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="body-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 32 }}>
          New here?{" "}
          <Link href="/get-started" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  );
}
