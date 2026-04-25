"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export function LoginForm({ sent: initialSent }: { sent: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(initialSent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        style={{
          padding: "24px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          textAlign: "center",
        }}
      >
        <CheckCircle2
          size={36}
          style={{ color: "var(--success)", marginBottom: 12 }}
        />
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          Check your inbox
        </div>
        <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20 }}>
          We sent a sign-in link to <strong>{email || "your email"}</strong>. It
          expires in 1 hour.
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="btn btn-ghost btn-sm"
          style={{ width: "100%" }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ position: "relative" }}>
        <Mail
          size={15}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-subtle)",
            pointerEvents: "none",
          }}
        />
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px 12px 40px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <p style={{ color: "var(--error)", fontSize: 13, margin: 0 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-accent"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {loading ? (
          <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <>
            Send sign-in link <ArrowRight size={14} />
          </>
        )}
      </button>
    </form>
  );
}
