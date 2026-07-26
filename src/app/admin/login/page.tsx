"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { OtpCodeInput } from "@/components/ui/OtpCodeInput";

const supabase = createSupabaseBrowserClient();

const RESEND_COOLDOWN = 30;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [code, setCode]       = useState("");
  const [step, setStep]       = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode() {
    setError(null);
    setLoading(true);

    /* Routed through the server so the address can be checked against
       ADMIN_EMAIL before anything is sent — calling signInWithOtp from here
       let anyone make us email a code to any address. The route answers 200
       either way, so advancing to the code step reveals nothing. */
    let ok = false;
    try {
      const res = await fetch("/api/admin/auth/request-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }

    setLoading(false);

    if (!ok) {
      setError("Couldn't send the code. Please try again in a moment.");
      return;
    }

    setStep("code");
    setCooldown(RESEND_COOLDOWN);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    await sendCode();
  }

  async function verifyCode() {
    if (code.length < 8 || loading) return;
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

    // The proxy re-checks the session against ADMIN_EMAIL and bounces
    // anyone who isn't the admin straight back here.
    router.push("/admin/dashboard");
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            CyprusTech<span style={{ color: "var(--accent)" }}>.Careers</span>
          </div>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", fontSize: 10 }}>
            ADMIN ACCESS
          </div>
        </div>

        <div style={{
          border: "1px solid var(--border)", borderRadius: 14, padding: 28,
          background: "var(--surface)",
        }}>
          {step === "code" ? (
            <div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h2 className="h3" style={{ marginBottom: 8 }}>Enter your code</h2>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 6 }}>
                  We sent an 8-digit code to
                </p>
                <div style={{ display: "inline-block", padding: "6px 14px", background: "var(--bg-alt)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)" }}>
                  {email}
                </div>
              </div>

              <OtpCodeInput value={code} onChange={setCode} disabled={loading} autoFocus />

              {error && (
                <p className="body-s" style={{ color: "#ef4444", textAlign: "center", marginTop: 16 }}>{error}</p>
              )}

              <button
                type="button"
                onClick={verifyCode}
                disabled={loading || code.length < 8}
                className="btn btn-accent"
                style={{ width: "100%", justifyContent: "center", marginTop: 20, opacity: loading || code.length < 8 ? 0.6 : 1 }}
              >
                {loading ? "Verifying…" : "Verify and sign in"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setCode(""); setError(null); }}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)" }}
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  onClick={() => { setCode(""); void sendCode(); }}
                  disabled={cooldown > 0 || loading}
                  style={{ background: "none", border: "none", padding: 0, cursor: cooldown > 0 ? "default" : "pointer", fontFamily: "var(--font-sans)", fontSize: 13, color: cooldown > 0 ? "var(--text-subtle)" : "var(--accent)" }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                  Admin email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hello@cyprustech.careers"
                  style={{
                    width: "100%", fontFamily: "var(--font-sans)", fontSize: 14,
                    padding: "10px 12px", border: "1px solid var(--border)",
                    borderRadius: 8, background: "var(--bg)", color: "var(--text)",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              {error && (
                <p style={{ color: "#ef4444", fontFamily: "var(--font-sans)", fontSize: 13 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-accent"
                style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Sending…" : "Send sign-in code"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
