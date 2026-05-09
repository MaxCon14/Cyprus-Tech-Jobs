"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";

interface Category {
  slug:  string;
  label: string;
}

interface Props {
  categories?:          Category[];
  defaultCategorySlug?: string;
  companyName?:         string;
  companyId?:           string;
}

type Step = "idle" | "loading" | "done" | "error";

export function JobAlertForm({ categories = [], defaultCategorySlug, companyName, companyId }: Props) {
  const [email,       setEmail]       = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [category,    setCategory]    = useState(defaultCategorySlug ?? "");
  const [freq,        setFreq]        = useState<"DAILY" | "WEEKLY">("WEEKLY");
  const [step,        setStep]        = useState<Step>("idle");
  const [err,         setErr]         = useState("");

  useEffect(() => {
    createSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user?.email) setSessionEmail(session.user.email);
      });
  }, []);

  const effectiveEmail = sessionEmail ?? email;
  const isLoggedIn     = sessionEmail !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!isLoggedIn && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      setErr("Please enter a valid email address.");
      return;
    }

    setStep("loading");
    try {
      const res = await fetch("/api/candidates/alert", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:          effectiveEmail,
          categoryId:     category || null,
          companyId:      companyId  || null,
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

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }} noValidate>
      {companyName && !isLoggedIn && (
        <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>
          Get notified when {companyName} posts a new role
        </p>
      )}

      {/* Email — hidden when already logged in */}
      {!isLoggedIn && (
        <input
          className="input"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); }}
          required
          autoComplete="email"
        />
      )}

      {/* Logged-in hint */}
      {isLoggedIn && (
        <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>
          Alerts sent to <strong>{sessionEmail}</strong>
        </p>
      )}

      {/* Category — only shown on general form (not company-specific) */}
      {categories.length > 0 && !companyName && (
        <Select
          name="category"
          placeholder="All categories"
          value={category}
          onChange={val => setCategory(val)}
          options={categories.map(cat => ({ label: cat.label, value: cat.slug }))}
        />
      )}

      {/* Frequency toggle */}
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
        {step === "loading" ? "Subscribing…" : <><Bell size={14} />{companyName ? "Notify me" : "Get alerts"}</>}
      </button>

      {!companyName && !isLoggedIn && (
        <p className="mono-s" style={{ color: "var(--text-subtle)", margin: 0 }}>UNSUBSCRIBE ANYTIME · NO SPAM</p>
      )}
    </form>
  );
}
