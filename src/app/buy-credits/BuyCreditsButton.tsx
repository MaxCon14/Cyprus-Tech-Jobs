"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  slotPriceKey: string;
  employerId:   string;
  label:        string;
}

export function BuyCreditsButton({ slotPriceKey, employerId, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ slotPriceKey, employerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn btn-accent"
        style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
      >
        {loading
          ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Redirecting…</>
          : label
        }
      </button>
      {error && (
        <p style={{ color: "var(--error)", fontSize: 12, marginTop: 8, textAlign: "center" }}>{error}</p>
      )}
    </div>
  );
}
