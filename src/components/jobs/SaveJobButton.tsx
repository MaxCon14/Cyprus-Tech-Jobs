"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export function SaveJobButton({ jobId, initialSaved }: { jobId: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const optimistic = !saved;
    setSaved(optimistic);
    try {
      const res = await fetch("/api/candidates/saved-jobs", {
        method: optimistic ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) setSaved(!optimistic);
    } catch {
      setSaved(!optimistic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Unsave job" : "Save job"}
      style={{
        background: "none",
        border: "none",
        cursor: loading ? "default" : "pointer",
        padding: 4,
        display: "grid",
        placeItems: "center",
        color: saved ? "var(--accent)" : "var(--text-subtle)",
        transition: "color 150ms ease, transform 150ms ease",
        transform: loading ? "scale(0.9)" : "scale(1)",
        flexShrink: 0,
      }}
    >
      <Heart
        size={18}
        fill={saved ? "var(--accent)" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}
