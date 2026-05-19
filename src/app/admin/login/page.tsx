"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();

export default function AdminLoginPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/admin/dashboard`,
      },
    });

    setLoading(false);

    if (err) {
      setError("Couldn't send sign-in link. Please try again.");
      return;
    }

    setSent(true);
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
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
              <h2 className="h2" style={{ marginBottom: 8 }}>Check your inbox</h2>
              <p className="body-s" style={{ color: "var(--text-muted)" }}>
                Sign-in link sent to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                {loading ? "Sending…" : "Send sign-in link →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
