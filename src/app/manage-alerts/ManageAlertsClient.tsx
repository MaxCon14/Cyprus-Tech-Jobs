"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Trash2, Save, ChevronDown } from "lucide-react";
import { CITIES } from "@/lib/placeholder-data";

const REMOTE_OPTIONS = [
  { label: "Any",     value: "" },
  { label: "Remote",  value: "REMOTE" },
  { label: "Hybrid",  value: "HYBRID" },
  { label: "On-site", value: "ON_SITE" },
];
const LEVEL_OPTIONS = [
  { label: "Any level", value: "" },
  { label: "Junior",    value: "JUNIOR" },
  { label: "Mid-level", value: "MID" },
  { label: "Senior",    value: "SENIOR" },
  { label: "Lead",      value: "LEAD" },
];
const FREQ_OPTIONS = [
  { label: "Weekly roundup", value: "WEEKLY" },
  { label: "Daily digest",   value: "DAILY" },
];

type AlertData = {
  token:           string;
  email:           string;
  categoryId:      string | null;
  categoryName:    string | null;
  remoteType:      string | null;
  city:            string | null;
  experienceLevel: string | null;
  alertFrequency:  string;
};

type Category = { id: string; label: string };

export function ManageAlertsClient({
  initialAlert,
  categories,
  autoUnsubscribe,
}: {
  initialAlert: AlertData;
  categories:   Category[];
  autoUnsubscribe: boolean;
}) {
  const [editing, setEditing]   = useState(false);
  const [status, setStatus]     = useState<"idle" | "saving" | "saved" | "unsubscribed" | "confirmUnsub">(
    autoUnsubscribe ? "confirmUnsub" : "idle",
  );
  const [form, setForm] = useState({
    categoryId:      initialAlert.categoryId ?? "",
    remoteType:      initialAlert.remoteType ?? "",
    city:            initialAlert.city ?? "",
    experienceLevel: initialAlert.experienceLevel ?? "",
    alertFrequency:  initialAlert.alertFrequency,
  });

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/alerts/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: initialAlert.token, ...form }),
      });
      if (res.ok) { setStatus("saved"); setEditing(false); }
      else { setStatus("idle"); }
    } catch { setStatus("idle"); }
  };

  const handleUnsubscribe = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/alerts/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: initialAlert.token }),
      });
      if (res.ok) setStatus("unsubscribed");
      else setStatus("confirmUnsub");
    } catch { setStatus("confirmUnsub"); }
  };

  if (status === "unsubscribed") {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-bg)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={26} style={{ color: "var(--success)" }} />
        </div>
        <h1 className="h2" style={{ marginBottom: 8 }}>You've been unsubscribed</h1>
        <p className="body" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          No more job alerts will be sent to <strong>{initialAlert.email}</strong>.
        </p>
        <Link href="/jobs" className="btn btn-accent">Browse jobs anyway →</Link>
      </div>
    );
  }

  const categoryLabel = form.categoryId
    ? (categories.find(c => c.id === form.categoryId)?.label ?? "All categories")
    : "All categories";

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Bell size={20} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="h2" style={{ marginBottom: 2 }}>Manage your alerts</h1>
          <p className="body-s" style={{ color: "var(--text-muted)" }}>{initialAlert.email}</p>
        </div>
      </div>

      {status === "saved" && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <CheckCircle2 size={15} /> Preferences saved.
        </div>
      )}

      {/* Preferences card */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "var(--surface)", marginBottom: 16 }}>
        {!editing ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span className="caption" style={{ color: "var(--text-subtle)" }}>YOUR PREFERENCES</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(true); setStatus("idle"); }}>
                Edit
              </button>
            </div>
            {[
              ["Category",    categoryLabel],
              ["Work type",   REMOTE_OPTIONS.find(o => o.value === form.remoteType)?.label ?? "Any"],
              ["City",        form.city || "All cities"],
              ["Level",       LEVEL_OPTIONS.find(o => o.value === form.experienceLevel)?.label ?? "Any level"],
              ["Frequency",   FREQ_OPTIONS.find(o => o.value === form.alertFrequency)?.label ?? "Weekly roundup"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="body-s" style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="body-s" style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 18 }}>EDIT PREFERENCES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="body-s" style={{ fontWeight: 500, display: "block", marginBottom: 5 }}>Category</label>
                <select className="select" value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="body-s" style={{ fontWeight: 500, display: "block", marginBottom: 5 }}>Work type</label>
                <select className="select" value={form.remoteType} onChange={e => set("remoteType", e.target.value)}>
                  {REMOTE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="body-s" style={{ fontWeight: 500, display: "block", marginBottom: 5 }}>City</label>
                <select className="select" value={form.city} onChange={e => set("city", e.target.value)}>
                  <option value="">All cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="body-s" style={{ fontWeight: 500, display: "block", marginBottom: 5 }}>Experience level</label>
                <select className="select" value={form.experienceLevel} onChange={e => set("experienceLevel", e.target.value)}>
                  {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="body-s" style={{ fontWeight: 500, display: "block", marginBottom: 5 }}>Alert frequency</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {FREQ_OPTIONS.map(o => (
                    <button key={o.value} type="button"
                      onClick={() => set("alertFrequency", o.value)}
                      style={{ padding: "10px", borderRadius: 8, border: `1.5px solid ${form.alertFrequency === o.value ? "var(--accent)" : "var(--border)"}`, background: form.alertFrequency === o.value ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: form.alertFrequency === o.value ? 600 : 400, color: form.alertFrequency === o.value ? "var(--accent)" : "var(--text)", transition: "all 120ms ease" }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="btn btn-accent" onClick={handleSave} disabled={status === "saving"} style={{ flex: 1, justifyContent: "center" }}>
                  <Save size={14} /> {status === "saving" ? "Saving…" : "Save preferences"}
                </button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Unsubscribe */}
      {status === "confirmUnsub" ? (
        <div style={{ border: "1px solid var(--error)", borderRadius: 12, padding: 20, background: "var(--error-bg)" }}>
          <p className="body-s" style={{ fontWeight: 600, color: "var(--error)", marginBottom: 6 }}>Are you sure?</p>
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 14 }}>
            You'll stop receiving all job alert emails at {initialAlert.email}.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm" onClick={handleUnsubscribe}
              style={{ background: "var(--error)", color: "#fff", border: "none" }}>
              <Trash2 size={13} /> Yes, unsubscribe
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setStatus("idle")}>Keep my alerts</button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setStatus("confirmUnsub")}
          style={{ color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 6 }}
        >
          <ChevronDown size={13} /> Unsubscribe from all alerts
        </button>
      )}
    </div>
  );
}
