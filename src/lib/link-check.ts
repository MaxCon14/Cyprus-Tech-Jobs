const CHECK_TIMEOUT_MS = 8000;

// A bare fetch's default UA gets blocked (403) by some ATS/career-page
// front doors that let real browsers through fine — a browser-like UA cuts
// down on false positives from that, not just from a 404.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36 CyprusTechCareersLinkChecker/1.0";

export type BrokenReason = "http-status" | "soft-404" | null;

export interface LinkCheckResult {
  /** True for a definite 404/410, or a 200 whose title/h1 reads as a soft
   *  404 — see checkApplyUrl for why everything else (403, 5xx, timeouts,
   *  DNS failures) is left alone. */
  broken: boolean;
  status: number | null;
  reason: BrokenReason;
}

/* Many career sites render their "job not found" page with an ordinary 200 —
   the listing is gone, but nothing about the HTTP layer says so. Caught this
   in practice on an Exness careers page: 200 status, page body reading
   "404 / Not found / Looks like the page does not exist or has been moved."
   Restricted to <title>/<h1>/<h2> rather than the whole body on purpose — a
   real job description can legitimately contain phrases like "no longer
   accepting applications after <date>", and matching anywhere in the body
   would flag those too. A live job's title/heading tags essentially never
   contain this wording, so it's a low-noise signal. */
const SOFT_404_PATTERNS = [
  /\b404\b/,
  /\bnot found\b/i,
  /page (?:does not exist|doesn'?t exist|no longer exists|cannot be found|could not be found)/i,
  /(?:job|position|role|vacancy|listing) (?:has been filled|is no longer available|has expired|has closed)/i,
];

function extractTagText(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1].replace(/<[^>]+>/g, " ").trim() : "";
}

function looksLikeSoft404(html: string): boolean {
  const signal = [
    extractTagText(html, "title"),
    extractTagText(html, "h1"),
    extractTagText(html, "h2"),
  ].join(" ");
  return SOFT_404_PATTERNS.some(p => p.test(signal));
}

/**
 * Check whether a job's external "Apply" URL still resolves.
 *
 * Deliberately conservative on the HTTP layer: only a genuine 404 or 410
 * counts as broken by status code. Career pages routinely 403 a non-browser
 * request, time out under load, or blip a 5xx — none of that means the
 * listing closed, and flagging on it would train the admin to ignore the
 * warning. GET (not HEAD) because a lot of ATS platforms 405 or misreport
 * on HEAD — and because the body is what the soft-404 check below needs.
 */
export async function checkApplyUrl(url: string): Promise<LinkCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, "Accept": "text/html,*/*" },
    });

    if (res.status === 404 || res.status === 410) {
      return { broken: true, status: res.status, reason: "http-status" };
    }

    if (res.ok) {
      const html = await res.text();
      if (looksLikeSoft404(html)) {
        return { broken: true, status: res.status, reason: "soft-404" };
      }
    }

    return { broken: false, status: res.status, reason: null };
  } catch {
    // Network error, timeout, DNS failure, TLS failure, aborted redirect
    // chain — inconclusive. A page that's temporarily unreachable is not
    // the same thing as a listing the employer closed.
    return { broken: false, status: null, reason: null };
  } finally {
    clearTimeout(timeout);
  }
}
