"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { CITIES } from "@/lib/placeholder-data";

const REMOTE_OPTIONS = [
  { label: "Any work type", value: "" },
  { label: "Remote",        value: "REMOTE" },
  { label: "Hybrid",        value: "HYBRID" },
  { label: "On-site",       value: "ON_SITE" },
];
const LEVEL_OPTIONS = [
  { label: "Any level", value: "" },
  { label: "Junior",    value: "JUNIOR" },
  { label: "Mid-level", value: "MID" },
  { label: "Senior",    value: "SENIOR" },
  { label: "Lead",      value: "LEAD" },
];
const FREQ_OPTIONS = [
  { label: "Weekly", value: "WEEKLY" },
  { label: "Daily",  value: "DAILY" },
];

type Category = { id: string; label: string; slug: string };

export function AlertForm({ categories }: { categories: Category[] }) {
  const [email,           setEmail]           = useState("");
  const [categoryId,      setCategoryId]      = useState("");
  const [remoteType,      setRemoteType]      = useState("");
  const [city,            setCity]            = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [alertFrequency,  setAlertFrequency]  = useState("WEEKLY");
  const [showMore,        setShowMore]        = useState(false);
  const [jobCount,        setJobCount]        = useState<number | null>(null);
  const [status,          setStatus]          = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg,        setErrorMsg]        = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live job count — debounced
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const p = new URLSearchParams();
      if (categoryId)      p.set("category", categoryId);
      if (remoteType)      p.set("type",     remoteType);
      if (city)            p.set("city",      city);
      if (experienceLevel) p.set("level",     experienceLevel);
      try {
        const res = await fetch(`/api/jobs/count?${p}`);
        const data = await res.json();
        setJobCount(typeof data.count === "number" ? data.count : null);
      } catch { /* ignore */ }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [categoryId, remoteType, city, experienceLevel]);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/candidates/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:           email.trim(),
          categoryId:      categoryId || null,
          remoteType:      remoteType || null,
          city:            city || null,
          experienceLevel: experienceLevel || null,
          alertFrequency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{ padding: "8px 0" }}>
        <p className="body-s" style={{ fontWeight: 600, color: "var(--success)", marginBottom: 4 }}>✓ You're subscribed!</p>
        <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 8 }}>
          Check <strong>{email}</strong> for a confirmation — manage or cancel any time from the link inside.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Email */}
      <input
        className="input"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
      />

      {/* Category */}
      <select className="select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
        <option value="">All categories</option>
        {categories.slice(1).map(cat => (
          <option key={cat.id} value={cat.id}>{cat.label}</option>
        ))}
      </select>

      {/* More filters toggle */}
      <button
        type="button"
        onClick={() => setShowMore(v => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: "2px 0", color: "var(--text-subtle)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em" }}
      >
        <span>MORE FILTERS</span>
        <ChevronDown size={13} style={{ transition: "transform 200ms ease", transform: showMore ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {showMore && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 2 }}>
          <select className="select" value={remoteType} onChange={e => setRemoteType(e.target.value)}>
            {REMOTE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="select" value={city} onChange={e => setCity(e.target.value)}>
            <option value="">Any city</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
            {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div style={{ display: "flex", gap: 6 }}>
            {FREQ_OPTIONS.map(o => (
              <button key={o.value} type="button"
                onClick={() => setAlertFrequency(o.value)}
                style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1.5px solid ${alertFrequency === o.value ? "var(--accent)" : "var(--border)"}`, background: alertFrequency === o.value ? "var(--accent-soft)" : "var(--surface)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: alertFrequency === o.value ? 600 : 400, color: alertFrequency === o.value ? "var(--accent)" : "var(--text-muted)", transition: "all 120ms ease" }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live job count */}
      {jobCount !== null && (
        <p className="mono-s" style={{ color: "var(--text-subtle)", margin: "2px 0" }}>
          {jobCount === 0 ? "No jobs match these filters yet — we'll alert you when they appear." : `${jobCount} job${jobCount !== 1 ? "s" : ""} currently match these filters`}
        </p>
      )}

      {errorMsg && <p className="body-s" style={{ color: "var(--error)" }}>{errorMsg}</p>}

      <button
        className="btn btn-accent"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={handleSubmit}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Subscribing…" : "Get free alerts"}
      </button>
    </div>
  );
}
