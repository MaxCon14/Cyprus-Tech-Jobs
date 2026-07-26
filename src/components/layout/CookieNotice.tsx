"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

/**
 * Cookie notice.
 *
 * Every cookie this site sets is strictly necessary — the Supabase auth
 * session — and the analytics are cookieless, so under the ePrivacy exemption
 * there is nothing here to consent to. This is therefore a notice, not a
 * consent gate: offering Accept/Reject over cookies that cannot be declined
 * would be a choice in name only.
 *
 * The stored record is versioned and shaped like a consent record so that the
 * day a non-essential tool is added (analytics with cookies, an ad pixel), this
 * can grow categories without every visitor's prior dismissal silently counting
 * as consent to something they were never shown. Bump NOTICE_VERSION then and
 * the notice reappears.
 */

const STORAGE_KEY    = "ctc-cookie-notice";
const NOTICE_VERSION = 1;

type NoticeRecord = { version: number; acknowledgedAt: string };

function alreadyAcknowledged(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<NoticeRecord>;
    return parsed?.version === NOTICE_VERSION;
  } catch {
    // Private mode or blocked storage: show the notice rather than assume consent.
    return false;
  }
}

export function CookieNotice() {
  /* Starts hidden and only appears after mount. The server cannot know whether
     this visitor has dismissed it, so rendering it in the HTML would flash the
     bar on every page load for people who already dismissed it. */
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!alreadyAcknowledged()) setVisible(true);
  }, []);

  function dismiss() {
    try {
      const record: NoticeRecord = { version: NOTICE_VERSION, acknowledgedAt: new Date().toISOString() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Storage unavailable — hide for this session at least.
    }
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

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss cookie notice"
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
          Essential cookies only
        </p>
        <p className="body-s" style={{ color: "var(--text-muted)", margin: "0 0 8px" }}>
          We use one cookie, to keep you signed in. No advertising, no tracking, and nothing sold or shared.
        </p>
        <Link href="/cookies" className="body-s" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
          Read the cookie policy
        </Link>

        <div className="cookie-notice-actions">
          <button type="button" onClick={dismiss} className="btn btn-accent btn-sm">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
