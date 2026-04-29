import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — CyprusTech.Careers",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { callbackUrl, error } = await searchParams;

  // Already signed in — let the callback routing logic decide where to send them
  if (user) redirect(callbackUrl ?? "/");

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 5vw, 40px) var(--page-padding-x)" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "var(--text)" }}>
              CyprusTech<span style={{ color: "var(--accent)" }}>.Jobs</span>
            </span>
          </Link>
          <h1 className="h1" style={{ marginBottom: 10, marginTop: 20 }}>Welcome back</h1>
          <p className="body" style={{ color: "var(--text-muted)" }}>
            Enter your email and we&apos;ll send you a sign-in link.
          </p>
        </div>

        {error === "auth_failed" && (
          <div className="alert alert-error" style={{ borderRadius: 10, marginBottom: 24 }}>
            That link is invalid or has expired. Request a new one below.
          </div>
        )}

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 28px 24px", boxShadow: "var(--shadow-sm)", marginBottom: 24 }}>
          <LoginForm callbackUrl={callbackUrl} />
        </div>

        <p className="body-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
          New here?{" "}
          <Link href="/get-started" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Create a free account →
          </Link>
        </p>
      </div>
    </div>
  );
}
