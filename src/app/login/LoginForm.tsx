"use client";

import { useState, useEffect } from "react";
import { Mail, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { OtpCodeInput } from "@/components/ui/OtpCodeInput";

const supabase = createSupabaseBrowserClient();
const RESEND_COOLDOWN = 60;

export function LoginForm({ authError }: { authError?: string }) {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [step, setStep]       = useState<"email" | "code">("email");
  const [code, setCode]       = useState("");
  const [role, setRole]       = useState<"employer" | "candidate" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(authError ?? null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && step === "code" && !loading) verifyCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function sendCode(targetEmail: string) {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    const { role: detectedRole } = await res.json();

    if (!detectedRole) {
      setError("No account found for that email address.");
      setLoading(false);
      return;
    }

    const { error: err } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: { shouldCreateUser: false },
    });

    setLoading(false);

    if (err) {
      setError("Couldn't send the code. Please try again.");
      return;
    }

    setRole(detectedRole);
    setStep("code");
    setCooldown(RESEND_COOLDOWN);
  }

  async function verifyCode() {
    if (code.length < 6 || loading) return;
    setError(null);
    setLoading(true);

    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (err) {
      setError("Incorrect or expired code. Please try again.");
      setCode("");
      setLoading(false);
      return;
    }

    // Best-effort — mark email as verified
    await fetch("/api/auth/mark-verified", { method: "POST" }).catch(() => {});

    const destination = role === "candidate" ? "/candidates/dashboard" : "/employers/dashboard";
    router.push(destination);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendCode(email);
  }

  if (step === "code") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ padding: "32px 28px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 className="h3" style={{ marginBottom: 8 }}>Enter your code</h2>
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 4 }}>
              We sent a 6-digit code to
            </p>
            <div style={{ display: "inline-block", padding: "6px 14px", background: "var(--bg-muted)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)" }}>
              {email}
            </div>
          </div>

          <OtpCodeInput value={code} onChange={setCode} disabled={loading} autoFocus />

          {error && (
            <p className="body-s" style={{ color: "var(--error)", textAlign: "center", marginTop: 16 }}>{error}</p>
          )}

          <button
            type="button"
            onClick={verifyCode}
            disabled={code.length < 6 || loading}
            className="btn btn-accent"
            style={{ width: "100%", justifyContent: "center", marginTop: 24 }}
          >
            {loading
              ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              : <>Verify code <ArrowRight size={14} /></>
            }
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => { sendCode(email); setCode(""); }}
              disabled={cooldown > 0 || loading}
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <RefreshCw size={13} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(null); }}
              className="btn btn-ghost btn-sm"
              style={{ width: "100%", justifyContent: "center", color: "var(--text-subtle)" }}
            >
              Use a different email
            </button>
          </div>
        </div>
        <p className="body-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 20 }}>
          The code expires in 1 hour. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ position: "relative" }}>
        <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
        <input
          className="input"
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(null); }}
          style={{ paddingLeft: 40 }}
          autoFocus
        />
      </div>

      {error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>{error}</p>
          {error.includes("No account") && (
            <p className="body-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
              <Link href="/get-started" style={{ color: "var(--accent)", textDecoration: "none" }}>
                Create a free account →
              </Link>
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>
        {loading
          ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
          : <>Send code <ArrowRight size={14} /></>
        }
      </button>
    </form>
  );
}
