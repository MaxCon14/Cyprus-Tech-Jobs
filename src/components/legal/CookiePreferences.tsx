"use client";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { readConsent, updateAnalyticsConsent, type AnalyticsConsent } from "@/lib/consent";

/**
 * Lets a visitor see and change their analytics choice after the fact,
 * without clearing browser data. CookieNotice only asks once; this is the
 * one place to revisit that decision.
 */
export function CookiePreferences() {
  // null = no decision recorded yet (matches CookieNotice still being shown)
  const [analytics, setAnalytics] = useState<AnalyticsConsent | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setAnalytics(readConsent()?.analytics ?? null);
  }, []);

  function choose(value: AnalyticsConsent) {
    updateAnalyticsConsent(value);
    setAnalytics(value);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "18px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, flexWrap: "wrap",
    }}>
      <div>
        <p className="body-s" style={{ color: "var(--text)", fontWeight: 600, margin: "0 0 4px" }}>
          Your analytics preference
        </p>
        <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>
          {analytics === "granted" && "Currently: accepted. Google Analytics is active."}
          {analytics === "denied"  && "Currently: declined. Google Analytics does not run for you."}
          {analytics === null      && "You haven't made a choice yet — the notice at the bottom of the screen is still waiting for one."}
          {justSaved && " Saved."}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="btn btn-outline btn-sm"
          disabled={analytics === "denied"}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <X size={13} /> Decline
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="btn btn-accent btn-sm"
          disabled={analytics === "granted"}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Check size={13} /> Accept
        </button>
      </div>
    </div>
  );
}
