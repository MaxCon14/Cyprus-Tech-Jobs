import Link from "next/link";
import { RoleCards } from "./RoleCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — CyprusTech.Jobs",
};

export default function GetStartedPage() {
  return (
    <div style={{ minHeight: "calc(100vh - 61px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(32px, 6vw, 60px) var(--page-padding-x)" }}>

      <div style={{ textAlign: "center", marginBottom: "clamp(32px, 5vw, 56px)", maxWidth: 520 }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 16 }}>GET STARTED</div>
        <h1 className="h1" style={{ marginBottom: 12 }}>How are you using CyprusTech.Jobs?</h1>
        <p className="body-l" style={{ color: "var(--text-muted)" }}>
          Choose your path — we&apos;ll tailor the experience for you.
        </p>
      </div>

      <RoleCards />

      <p className="body-s" style={{ color: "var(--text-subtle)", marginTop: 32 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
          Sign in →
        </Link>
      </p>

    </div>
  );
}
