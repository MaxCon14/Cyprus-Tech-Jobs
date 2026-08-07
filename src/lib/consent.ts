/**
 * Cookie-consent storage, shared between CookieNotice, the /cookies page's
 * preference control, and the Google Consent Mode bootstrap in
 * components/analytics/GoogleAnalytics.tsx.
 *
 * The bootstrap script that sets Consent Mode's default state runs as a
 * `beforeInteractive` inline <script> — plain JS with no bundler, so it can't
 * import this module. Its copy of the storage key/version is hand-kept in
 * sync with the constants below; if either changes, update both.
 */

export const CONSENT_STORAGE_KEY = "ctc-cookie-notice";

/* Bumped from 1 (plain acknowledgment, "we set nothing non-essential") to 2
   (a real analytics choice) when Google Analytics was added. Every visitor
   who dismissed the old notice sees the new one — their dismissal of a
   notice that had nothing to consent to cannot stand in for consent to
   something they were never shown. */
export const CONSENT_VERSION = 2;

export type AnalyticsConsent = "granted" | "denied";

export interface ConsentRecord {
  version:   number;
  updatedAt: string;
  analytics: AnalyticsConsent;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Returns the stored decision only if it's a valid, current-version record —
 *  a missing, corrupt, or old-version record means "no decision yet." */
export function readConsent(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (parsed.analytics !== "granted" && parsed.analytics !== "denied") return null;
    return parsed as ConsentRecord;
  } catch {
    // Private mode or blocked storage: treat as no decision rather than assume one.
    return null;
  }
}

function writeConsent(analytics: AnalyticsConsent): void {
  try {
    const record: ConsentRecord = { version: CONSENT_VERSION, updatedAt: new Date().toISOString(), analytics };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable — the gtag update below still applies for this session.
  }
}

/** Persist a decision and tell Consent Mode about it immediately. Safe to
 *  call even if gtag hasn't loaded (e.g. an ad/tracker blocker) — there's
 *  simply nothing to update on the GA side in that case, and no cookie gets
 *  set either way, which is the correct outcome for "denied" and a no-op
 *  worth accepting for "granted". */
export function updateAnalyticsConsent(analytics: AnalyticsConsent): void {
  writeConsent(analytics);
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("consent", "update", { analytics_storage: analytics });

  /* Clicking Accept doesn't navigate anywhere, so GoogleAnalyticsPageview's
   * route-change effect won't fire again on its own — without this, a
   * visitor who accepts and then leaves without clicking anything else
   * generates zero events. gtag.js's automatic page_view already fired once
   * at initial load while still denied (and was correctly suppressed, not
   * queued), so this is the one that actually reaches Google for this visit. */
  if (analytics === "granted") {
    window.gtag("event", "page_view", {
      page_path:     window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title:    document.title,
    });
  }
}
