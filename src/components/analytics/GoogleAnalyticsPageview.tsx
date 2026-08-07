"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Fires a GA4 page_view on every route change, including the first one.
 *
 * gtag.js's own automatic page_view (the default behaviour we turned off in
 * GoogleAnalytics.tsx) only fires once, on the initial full page load — it
 * has no way to know about Next.js client-side navigation between pages,
 * since that never triggers a real browser navigation event. Without this,
 * a visitor who lands on the homepage and clicks through to five job
 * listings would show up in GA as a single page_view, not six.
 *
 * Always calls gtag() regardless of the visitor's consent choice — Consent
 * Mode itself decides whether anything actually reaches Google based on the
 * analytics_storage state set in GoogleAnalytics.tsx/lib/consent.ts. This
 * component never needs to check consent itself, and shouldn't: that's
 * exactly the duplicated-logic mistake Google's own Consent Mode docs warn
 * against.
 */
export function GoogleAnalyticsPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const search = searchParams.toString();
    window.gtag("event", "page_view", {
      page_path:     search ? `${pathname}?${search}` : pathname,
      page_location: window.location.href,
      page_title:    document.title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()]);

  return null;
}
