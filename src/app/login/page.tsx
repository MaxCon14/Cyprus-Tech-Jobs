import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LoginForm } from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — CyprusTech.Careers",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email) {
    const [employer, { data: candidate }] = await Promise.all([
      prisma.employer.findUnique({ where: { email: user.email }, select: { id: true } }),
      supabaseAdmin.from("candidates").select("id").eq("email", user.email).single(),
    ]);
    redirect(employer ? "/employers/dashboard" : candidate ? "/candidates/dashboard" : "/");
  }

  const { error } = await searchParams;

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 5vw, 40px) var(--page-padding-x)" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "var(--text)" }}>
              CyprusTech<span style={{ color: "var(--accent)" }}>.Careers</span>
            </span>
          </Link>
          <h1 className="h1" style={{ marginTop: 20, marginBottom: 10 }}>Welcome back</h1>
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
          <LoginForm authError={error === "auth_failed" ? undefined : undefined} />
        </div>

        <p className="body-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
          New here?{" "}
          <Link href="/get-started" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  );
}
