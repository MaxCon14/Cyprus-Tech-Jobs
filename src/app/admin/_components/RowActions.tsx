"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
interface Action { label: string; endpoint: string; method?: "DELETE" | "PATCH"; body?: Record<string, unknown>; confirm?: string; destructive?: boolean; }
export function RowActions({ actions }: { actions: Action[] }) {
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  async function run(action: Action) {
    if (lock.current || (action.confirm && !window.confirm(action.confirm))) return;
    lock.current = true; setBusy(action.label); setMessage(null);
    try {
      const response = await fetch(action.endpoint, { method: action.method ?? "PATCH", headers: { "Content-Type": "application/json" }, body: action.body ? JSON.stringify(action.body) : undefined });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "This change could not be saved. Please try again.");
      setMessage({ text: "Saved", error: false }); router.refresh();
    } catch (error) { setMessage({ text: error instanceof Error ? error.message : "Connection failed. Please try again.", error: true }); }
    finally { lock.current = false; setBusy(null); }
  }
  return <div><div className="adm-row-actions">{actions.map(action => <button key={action.label} type="button" disabled={busy !== null} className={action.destructive ? "is-destructive" : ""} onClick={() => run(action)}>{busy === action.label && <Loader2 size={12} className="adm-spin" />}{action.label}</button>)}</div>{message && <p className={`adm-action-message ${message.error ? "is-error" : ""}`} role={message.error ? "alert" : "status"}>{message.text}</p>}</div>;
}
