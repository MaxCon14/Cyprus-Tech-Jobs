"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";

interface Category {
  slug: string;
  label: string;
}

interface Props {
  categories?: Category[];
  /** Pre-select a category by slug (e.g. when on a company profile page) */
  defaultCategorySlug?: string;
  /** Display context — shown as a label hint */
  companyName?: string;
}

type Step = "idle" | "loading" | "done" | "error";

export function JobAlertForm({ categories = [], defaultCategorySlug, companyName }: Props) {
  const [email,    setEmail]    = useState("");
  const [category, setCategory] = useState(defaultCategorySlug ?? "");
  const [freq,     setFreq]     = useState<"DAILY" | "WEEKLY">("WEEKLY");
  const [step,     setStep]     = useState<Step>("idle");
  const [err,      setErr]      = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Please enter a valid email address.");
      return;
    }

    setStep("loading");
    try {
      const res = await fetch("/api/candidates/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          categoryId: category || null,
          alertFrequency: freq,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }

      setStep("done");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep("error");
    }
  }

  if (step === "done") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "var(--surface-alt, #f9fafb)", border: "1px solid var(--border)", borderRadius: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Check size={14} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <p className="body-s" style={{ fontWeight: 600, marginBottom: 2 }}>You&apos;re subscribed!</p>
          <p className="body-s" style={{ color: "var(--text-muted)" }}>We&apos;ll email you when matching jobs are posted.</p>
        </div>
      </div>
    );
  }

  const placeholder = companyName
    ? `Get notified when ${companyName} posts a new role`
    : "Get new Cyprus tech jobs in your inbox";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }} noValidate>
      {companyName && (
        <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>{placeholder}</p>
      )}

      <input
        className="input"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => { setEmail(e.target.value); setErr(""); }}
        required
        autoComplete="email"
      />

      {categories.length > 0 && !companyName && (
        <select
          className="select"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat.slug} value={cat.slug}>{cat.label}</option>
          ))}
        </select>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {(["DAILY", "WEEKLY"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFreq(f)}
            className={`btn btn-sm${freq === f ? " btn-primary" : " btn-outline"}`}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {f === "DAILY" ? "Daily" : "Weekly"}
          </button>
        ))}
      </div>

      {err && (
        <p className="body-s" style={{ color: "var(--error, #ef4444)", margin: 0 }}>{err}</p>
      )}

      <button
        type="submit"
        className="btn btn-accent"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={step === "loading"}
      >
        {step === "loading" ? (
          "Subscribing…"
        ) : (
          <>
            <Bell size={14} />
            {companyName ? "Notify me" : "Get alerts"}
          </>
        )}
      </button>

      {!companyName && (
        <p className="mono-s" style={{ color: "var(--text-subtle)", margin: 0 }}>UNSUBSCRIBE ANYTIME · NO SPAM</p>
      )}
    </form>
  );
}
