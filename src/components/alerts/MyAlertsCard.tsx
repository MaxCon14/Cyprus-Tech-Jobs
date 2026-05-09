"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Building2, Layers, X, RefreshCw } from "lucide-react";

interface AlertRow {
  id:             string;
  alertFrequency: string;
  createdAt:      string;
  companyId:      string | null;
  companyName:    string | null;
  companySlug:    string | null;
  categoryId:     string | null;
  categoryName:   string | null;
  remoteType:     string | null;
  city:           string | null;
}

type LoadState = "loading" | "ready" | "error";

export function MyAlertsCard() {
  const [alerts,    setAlerts]    = useState<AlertRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [removing,  setRemoving]  = useState<Set<string>>(new Set());

  async function load() {
    setLoadState("loading");
    try {
      const res = await fetch("/api/candidates/alerts");
      if (!res.ok) throw new Error();
      setAlerts(await res.json());
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    setRemoving(prev => new Set(prev).add(id));
    await fetch("/api/candidates/alert", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ alertId: id }),
    });
    setAlerts(prev => prev.filter(a => a.id !== id));
    setRemoving(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  const companyAlerts  = alerts.filter(a => a.companyId);
  const generalAlerts  = alerts.filter(a => !a.companyId);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={14} style={{ color: "var(--accent)" }} />
          <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>My alerts</p>
          {alerts.length > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", background: "var(--accent-soft)", padding: "2px 7px", borderRadius: 99 }}>
              {alerts.length}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {loadState === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-subtle)", padding: "8px 0" }}>
            <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
            <p className="body-s" style={{ margin: 0 }}>Loading your alerts…</p>
          </div>
        )}

        {loadState === "error" && (
          <p className="body-s" style={{ color: "var(--error, #ef4444)", margin: 0 }}>
            Couldn't load alerts.{" "}
            <button onClick={load} className="btn btn-ghost btn-sm" style={{ padding: 0, height: "auto" }}>Retry</button>
          </p>
        )}

        {loadState === "ready" && alerts.length === 0 && (
          <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic", margin: 0 }}>
            No active alerts. Subscribe to job categories or follow companies to get notified.
          </p>
        )}

        {/* Company alerts */}
        {companyAlerts.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Building2 size={12} style={{ color: "var(--text-subtle)" }} />
              <span className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Companies
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {companyAlerts.map((a, i) => (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  padding: "10px 0",
                  borderBottom: i < companyAlerts.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {a.companySlug ? (
                      <Link href={`/companies/${a.companySlug}`} className="body-s" style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
                        {a.companyName ?? "Company"}
                      </Link>
                    ) : (
                      <span className="body-s" style={{ fontWeight: 600, color: "var(--text)" }}>
                        {a.companyName ?? "Company"}
                      </span>
                    )}
                    <p className="mono-s" style={{ color: "var(--text-subtle)", margin: "2px 0 0" }}>
                      {a.alertFrequency === "DAILY" ? "Daily digest" : "Weekly digest"}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(a.id)}
                    disabled={removing.has(a.id)}
                    title="Unsubscribe"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "4px 8px", color: "var(--text-subtle)", flexShrink: 0 }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General / category alerts */}
        {generalAlerts.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Layers size={12} style={{ color: "var(--text-subtle)" }} />
              <span className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Job categories
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {generalAlerts.map((a, i) => {
                const label = [
                  a.categoryName ?? (a.categoryId ? a.categoryId : "All categories"),
                  a.remoteType ? (a.remoteType === "REMOTE" ? "Remote" : a.remoteType === "HYBRID" ? "Hybrid" : "On-site") : null,
                  a.city,
                ].filter(Boolean).join(" · ");

                return (
                  <div key={a.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    padding: "10px 0",
                    borderBottom: i < generalAlerts.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {label}
                      </p>
                      <p className="mono-s" style={{ color: "var(--text-subtle)", margin: 0 }}>
                        {a.alertFrequency === "DAILY" ? "Daily digest" : "Weekly digest"}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(a.id)}
                      disabled={removing.has(a.id)}
                      title="Unsubscribe"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "4px 8px", color: "var(--text-subtle)", flexShrink: 0 }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
