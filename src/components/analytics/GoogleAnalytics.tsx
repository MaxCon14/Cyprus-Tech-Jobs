import Script from "next/script";

// Kept in sync by hand with CONSENT_STORAGE_KEY / CONSENT_VERSION in
// lib/consent.ts — see the comment there for why this can't just import them.
const GA_MEASUREMENT_ID = "G-MGNJW82FYC";

/**
 * Google Analytics 4, loaded under Google Consent Mode v2.
 *
 * gtag.js loads unconditionally (Google's own guidance — it needs to run to
 * model consent state at all), but nothing is actually stored in the
 * visitor's browser until they accept analytics in the cookie notice: the
 * `beforeInteractive` script below sets every Consent Mode signal to
 * "denied" by default, *before* gtag.js or the config call can run, unless a
 * prior "granted" decision is already sitting in localStorage. CookieNotice
 * flips it to "granted" via lib/consent's updateAnalyticsConsent when (and
 * only when) the visitor accepts.
 *
 * This is what keeps the site's Cookie Policy claim — "nothing non-essential
 * runs until you agree" — true with GA installed rather than becoming false
 * the moment this component was added.
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script id="consent-mode-default" strategy="beforeInteractive">
        {`
          (function () {
            window.dataLayer = window.dataLayer || [];
            function gtag() { window.dataLayer.push(arguments); }
            window.gtag = gtag;

            var granted = false;
            try {
              var raw = window.localStorage.getItem("ctc-cookie-notice");
              if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && parsed.version === 2 && parsed.analytics === "granted") {
                  granted = true;
                }
              }
            } catch (e) {}

            gtag("consent", "default", {
              ad_storage: "denied",
              ad_user_data: "denied",
              ad_personalization: "denied",
              analytics_storage: granted ? "granted" : "denied",
            });
            gtag("js", new Date());
          })();
        `}
      </Script>

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`gtag("config", "${GA_MEASUREMENT_ID}");`}
      </Script>
    </>
  );
}
