import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — CyprusTech.Jobs",
};

export default async function CandidateLoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/candidates/dashboard");

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 5vw, 40px) var(--page-padding-x)" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16 }}>Job seeker login</p>
          <h1 className="h1" style={{ marginBottom: 10 }}>Welcome back</h1>
          <p className="body" style={{ color: "var(--text-muted)" }}>
            Enter your email and we'll send you a sign-in link.
          </p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 28px 24px", boxShadow: "var(--shadow-sm)", marginBottom: 24 }}>
          <LoginForm />
        </div>

        <p className="body-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link href="/candidates/onboarding" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
