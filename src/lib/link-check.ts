const CHECK_TIMEOUT_MS = 8000;

// A bare fetch's default UA gets blocked (403) by some ATS/career-page
// front doors that let real browsers through fine — a browser-like UA cuts
// down on false positives from that, not just from a 404.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36 CyprusTechCareersLinkChecker/1.0";

export interface LinkCheckResult {
  /** True only for a definite 404/410 — see checkApplyUrl for why everything
   *  else (403, 5xx, timeouts, DNS failures) is left alone. */
  broken: boolean;
  status: number | null;
}

/**
 * Check whether a job's external "Apply" URL still resolves.
 *
 * Deliberately conservative: only a genuine 404 or 410 counts as broken.
 * Career pages routinely 403 a non-browser request, time out under load, or
 * blip a 5xx — none of that means the listing closed, and flagging on it
 * would train the admin to ignore the warning. GET (not HEAD) because a lot
 * of ATS platforms 405 or misreport on HEAD.
 *
 * This cannot catch a "soft 404" — a client-rendered SPA that returns 200
 * with a JS-rendered "this job has been filled" page. Only a real HTTP
 * status change is detectable without running a headless browser per job.
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
    return { broken: res.status === 404 || res.status === 410, status: res.status };
  } catch {
    // Network error, timeout, DNS failure, TLS failure, aborted redirect
    // chain — inconclusive. A page that's temporarily unreachable is not
    // the same thing as a listing the employer closed.
    return { broken: false, status: null };
  } finally {
    clearTimeout(timeout);
  }
}
