"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Building2, Layers, X, RefreshCw, Check } from "lucide-react";

/**
 * Everything about job alerts in one card.
 *
 * This used to be two: "Job alerts", which set the digest cadence, and "My
 * alerts", which listed what you had subscribed to. Both carried a bell icon
 * and both were about alerts, so the split asked the reader to work out which
 * box owned which decision. They are one thing seen from two sides — when the
 * digest arrives, and what goes in it.
 *
 * Delivery saves on click rather than behind an Edit mode: a three-option
 * segmented control does not need a save step, and an edit mode over the whole
 * card would have put the subscription list into a state it has no business
 * being in.
 *
 * Off is a real opt-out, not a label. It goes through PATCH
 * /api/candidates/alerts, which unconfirms the JobAlert rows the send-alerts
 * cron selects on. Writing candidates.alertFrequency alone — which is what the
 * old "Job alerts" card did — changed the wording here and nothing else.
 */

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
type Delivery = "OFF" | "DAILY" | "WEEKLY";

function remoteWord(t: string | null): string | null {
  if (t === "REMOTE") return "Remote";
  if (t === "HYBRID") return "Hybrid";
  if (t === "ON_SITE") return "On-site";
  return null;
}

export function AlertsCard({ email, initialFrequency }: { email: string; initialFrequency: string }) {
  const [alerts,    setAlerts]    = useState<AlertRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [removing,  setRemoving]  = useState<Set<string>>(new Set());

  const [delivery, setDelivery] = useState<Delivery>(
    initialFrequency === "OFF" ? "OFF" : initialFrequency === "DAILY" ? "DAILY" : "WEEKLY",
  );
  const [savingFreq, setSavingFreq] = useState(false);
  const [savedFreq,  setSavedFreq]  = useState(false);
  const [freqError,  setFreqError]  = useState(false);

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

  async function chooseDelivery(next: Delivery) {
    if (next === delivery || savingFreq) return;
    const previous = delivery;
    setDelivery(next);            // optimistic; a delivery setting is cheap to undo
    setSavingFreq(true);
    setFreqError(false);
    setSavedFreq(false);
    try {
      /* Not /api/candidates/profile: that writes candidates.alertFrequency,
         which nothing that sends email reads. This endpoint updates the
         JobAlert rows the cron actually selects on. */
      const res = await fetch("/api/candidates/alerts", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ mode: next }),
      });
      if (!res.ok) throw new Error();
      setSavedFreq(true);
      setTimeout(() => setSavedFreq(false), 2000);
    } catch {
      setDelivery(previous);
      setFreqError(true);
    }
    setSavingFreq(false);
  }

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

  const companyAlerts = alerts.filter(a => a.companyId);
  const categoryAlerts = alerts.filter(a => !a.companyId);

  /* A row only states its own cadence when it differs from the account setting
     above it. Repeating "Weekly digest" under every row when the header already
     says weekly is noise. */
  function rowCadence(a: AlertRow): string | null {
    const own = a.alertFrequency === "DAILY" ? "DAILY" : "WEEKLY";
    if (own === delivery) return null;
    return own === "DAILY" ? "Daily" : "Weekly";
  }

  function AlertRowView({ a, last, primary, href }: {
    a: AlertRow; last: boolean; primary: string; href?: string | null;
  }) {
    const cadence = rowCadence(a);
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        padding: "10px 0", borderBottom: last ? "none" : "1px solid var(--border)",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {href
            ? <Link href={href} className="body-s" style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>{primary}</Link>
            : <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{primary}</p>}
          {cadence && (
            <p className="mono-s" style={{ color: "var(--text-subtle)", margin: "2px 0 0" }}>{cadence}</p>
          )}
        </div>
        <button
          onClick={() => remove(a.id)}
          disabled={removing.has(a.id)}
          aria-label={`Stop alerts for ${primary}`}
          className="btn btn-ghost btn-sm"
          style={{ padding: "4px 8px", color: "var(--text-subtle)", flexShrink: 0 }}
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={14} style={{ color: "var(--accent)" }} />
          <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>Job alerts</p>
          {alerts.length > 0 && (
            <span className="mono-s" style={{ color: "var(--accent)", background: "var(--accent-soft)", padding: "2px 7px", borderRadius: 99 }}>
              {alerts.length}
            </span>
          )}
        </div>
        {savingFreq && <RefreshCw size={12} style={{ color: "var(--text-subtle)", animation: "spin 1s linear infinite" }} />}
        {savedFreq && !savingFreq && (
          <span className="mono-s" style={{ color: "var(--success)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Check size={12} /> SAVED
          </span>
        )}
      </div>

      {/* ── When it arrives ── */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <p className="body-s" style={{ color: "var(--text-muted)", margin: "0 0 10px" }}>
          {delivery === "OFF"
            ? "Alerts are off. Your subscriptions are kept, so you can turn them back on any time."
            : <>{"Sent to "}<span style={{ color: "var(--text)", fontWeight: 500, wordBreak: "break-all" }}>{email}</span></>}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {(["WEEKLY", "DAILY", "OFF"] as const).map(mode => {
            const active = delivery === mode;
            const label  = mode === "DAILY" ? "Daily" : mode === "WEEKLY" ? "Weekly" : "Off";
            const sub    = mode === "DAILY" ? "MORNINGS" : mode === "WEEKLY" ? "MONDAYS" : "NO EMAIL";
            return (
              <button
                key={mode} type="button"
                onClick={() => chooseDelivery(mode)}
                aria-pressed={active}
                style={{
                  padding: "9px 8px", borderRadius: 8,
                  border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent-soft)" : "var(--surface)",
                  cursor: "pointer", textAlign: "center", transition: "all 150ms ease",
                }}
              >
                <div className="body-s" style={{ fontWeight: 600, color: active ? "var(--accent)" : "var(--text)" }}>
                  {label}
                </div>
                <div className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10 }}>
                  {sub}
                </div>
              </button>
            );
          })}
        </div>
        {freqError && (
          <p className="body-s" style={{ color: "var(--error)", margin: "8px 0 0" }}>
            Couldn&apos;t save that. Try again.
          </p>
        )}
      </div>

      {/* ── What goes in it ── */}
      <div style={{ padding: "14px 20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {loadState === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-subtle)", padding: "4px 0" }}>
            <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
            <p className="body-s" style={{ margin: 0 }}>Loading your alerts…</p>
          </div>
        )}

        {loadState === "error" && (
          <p className="body-s" style={{ color: "var(--error)", margin: 0 }}>
            {"Couldn't load your alerts. "}
            <button onClick={load} className="btn btn-ghost btn-sm" style={{ padding: 0, height: "auto" }}>Retry</button>
          </p>
        )}

        {loadState === "ready" && alerts.length === 0 && (
          <div>
            <p className="body-s" style={{ color: "var(--text-muted)", margin: "0 0 10px" }}>
              You haven&apos;t subscribed to anything yet, so the digest has nothing to send.
            </p>
            <Link href="/jobs" className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }}>
              Find roles to follow
            </Link>
          </div>
        )}

        {companyAlerts.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Building2 size={12} style={{ color: "var(--text-subtle)" }} />
              <span className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Companies
              </span>
            </div>
            {companyAlerts.map((a, i) => (
              <AlertRowView
                key={a.id} a={a} last={i === companyAlerts.length - 1}
                primary={a.companyName ?? "Company"}
                href={a.companySlug ? `/companies/${a.companySlug}` : null}
              />
            ))}
          </div>
        )}

        {categoryAlerts.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Layers size={12} style={{ color: "var(--text-subtle)" }} />
              <span className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Job categories
              </span>
            </div>
            {categoryAlerts.map((a, i) => (
              <AlertRowView
                key={a.id} a={a} last={i === categoryAlerts.length - 1}
                primary={[
                  a.categoryName ?? (a.categoryId ? a.categoryId : "All categories"),
                  remoteWord(a.remoteType),
                  a.city,
                ].filter(Boolean).join(" · ")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
