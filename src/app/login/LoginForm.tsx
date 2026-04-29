"use client";

import { useState, useEffect } from "react";
import { Mail, ArrowRight, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();
const RESEND_COOLDOWN = 60;

interface Props {
  callbackUrl?: string;
  initialError?: string;
}

export function LoginForm({ callbackUrl, initialError }: Props) {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(initialError ?? null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendLink(targetEmail: string) {
    setError(null);
    setLoading(true);

    const check = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    const { exists } = await check.json();

    if (!exists) {
      setError("No account found for that email.");
      setLoading(false);
      return;
    }

    const next = callbackUrl || "";
    const { error: err } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/api/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      },
    });

    setLoading(false);

    if (err) {
      setError("Couldn't send the sign-in link. Please try again.");
      return;
    }

    setSent(true);
    setCooldown(RESEND_COOLDOWN);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendLink(email);
  }

  if (sent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ padding: "32px 28px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--success-bg)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={24} style={{ color: "var(--success)" }} />
          </div>
          <h2 className="h3" style={{ marginBottom: 8 }}>Check your inbox</h2>
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20 }}>We sent a sign-in link to</p>
          <div style={{ display: "inline-block", padding: "8px 16px", background: "var(--bg-muted)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", marginBottom: 28 }}>
            {email}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" onClick={() => sendLink(email)} disabled={cooldown > 0}
              className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              <RefreshCw size={13} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
            </button>
            <button type="button" onClick={() => { setSent(false); setEmail(""); setError(null); }}
              className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", color: "var(--text-subtle)" }}>
              Use a different email
            </button>
          </div>
        </div>
        <p className="body-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 20 }}>
          The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ position: "relative" }}>
        <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
        <input
          className="input"
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          style={{ paddingLeft: 40 }}
          autoFocus
        />
      </div>

      {error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>{error}</p>
          {error.includes("No account found") && (
            <p className="body-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
              <Link href="/get-started" style={{ color: "var(--accent)", textDecoration: "none" }}>Create a free account →</Link>
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>
        {loading
          ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
          : <>Send sign-in link <ArrowRight size={14} /></>}
      </button>
    </form>
  );
}
