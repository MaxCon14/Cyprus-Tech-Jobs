"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { readConsent, updateAnalyticsConsent } from "@/lib/consent";

/**
 * Cookie notice.
 *
 * Until Google Analytics was added, every cookie this site set was strictly
 * necessary — the Supabase auth session — and the analytics were cookieless,
 * so under the ePrivacy exemption there was nothing here to consent to. This
 * was a notice, not a consent gate: offering Accept/Reject over cookies that
 * cannot be declined would have been a choice in name only.
 *
 * That's no longer true. GA sets non-essential tracking cookies, so this is
 * now a real consent gate for the one category that needs it — analytics.
 * The Supabase auth cookie stays unconditional; it isn't part of the choice
 * because it's strictly necessary and was never gated in the first place.
 * See lib/consent.ts and components/analytics/GoogleAnalytics.tsx for how
 * the "denied by default until accepted" behaviour is actually enforced —
 * this component only records the choice and reflects it to gtag.
 */

export function CookieNotice() {
  /* Starts hidden and only appears after mount. The server cannot know
     whether this visitor already made a choice, so rendering it in the HTML
     would flash the bar on every page load for people who already decided. */
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
  }, []);

  function choose(analytics: "granted" | "denied") {
    updateAnalyticsConsent(analytics);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 190,
        padding: "clamp(12px, 3vw, 20px)",
        display: "flex", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        className="cookie-notice"
        style={{
          pointerEvents: "auto",
          width: "100%", maxWidth: 720,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(10,10,10,0.16)",
          padding: "16px 18px",
        }}
      >
        {/* Icon sits above the text rather than beside it, so the heading,
            description and link form one uninterrupted column to read down. */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: "var(--accent-soft)", color: "var(--accent)",
            display: "grid", placeItems: "center",
          }}>
            <Cookie size={16} />
          </span>

          {/* Closing without an explicit choice is treated the same as
              Reject — consent has to be an affirmative action, so a close
              button can decline on your behalf but never grant. */}
          <button
            type="button"
            onClick={() => choose("denied")}
            aria-label="Close and decline analytics"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-subtle)", padding: 4, display: "grid",
              placeItems: "center", flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p className="body-s" style={{ color: "var(--text)", margin: "0 0 4px", fontWeight: 600 }}>
          Cookie preferences
        </p>
        <p className="body-s" style={{ color: "var(--text-muted)", margin: "0 0 8px" }}>
          We use one strictly necessary cookie to keep you signed in — that's never optional. We'd also like to use Google Analytics to see how the site is used; it only runs if you say yes, and you can change your mind any time.
        </p>
        <Link href="/cookies" className="body-s" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
          Read the cookie policy
        </Link>

        <div className="cookie-notice-actions">
          <button type="button" onClick={() => choose("denied")} className="btn btn-outline btn-sm">
            Reject
          </button>
          <button type="button" onClick={() => choose("granted")} className="btn btn-accent btn-sm">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
