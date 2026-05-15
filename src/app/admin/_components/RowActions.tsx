"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Action {
  label: string;
  endpoint: string;
  method?: "DELETE" | "PATCH";
  body?: Record<string, unknown>;
  confirm?: string;
  destructive?: boolean;
}

export function RowActions({ actions }: { actions: Action[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: Action) {
    if (action.confirm && !confirm(action.confirm)) return;
    setBusy(true);
    try {
      await fetch(action.endpoint, {
        method: action.method ?? "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action.body ? JSON.stringify(action.body) : undefined,
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {actions.map(a => (
        <button
          key={a.label}
          onClick={() => run(a)}
          disabled={busy}
          style={{
            padding: "4px 10px", borderRadius: 5, border: "1px solid var(--border)",
            background: a.destructive ? "#fef2f2" : "var(--surface)",
            color: a.destructive ? "#ef4444" : "var(--text-muted)",
            fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500,
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
