import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer sign in — CyprusTech.Jobs",
};

type Props = {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/employers/dashboard");

  const { error } = await searchParams;

  return (
    <div style={{ maxWidth: 440, margin: "80px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12 }}>
          EMPLOYER PORTAL
        </div>
        <h1 className="h1" style={{ marginBottom: 8 }}>Sign in</h1>
        <p className="body-s" style={{ color: "var(--text-muted)" }}>
          Enter your employer email and we&apos;ll send you a sign-in link.
        </p>
      </div>

      {error === "auth_failed" && (
        <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--error-bg)", border: "1px solid var(--error)", color: "var(--error)", fontSize: 14, marginBottom: 24 }}>
          That link is invalid or has expired. Request a new one below.
        </div>
      )}

      <LoginForm error={undefined} />

      <p className="body-s" style={{ color: "var(--text-subtle)", marginTop: 24 }}>
        Don&apos;t have an employer account?{" "}
        <a href="/get-started" style={{ color: "var(--accent)", textDecoration: "none" }}>Create one</a>
      </p>
    </div>
  );
}
