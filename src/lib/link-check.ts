const CHECK_TIMEOUT_MS = 8000;

// A bare fetch's default UA gets blocked (403) by some ATS/career-page
// front doors that let real browsers through fine — a browser-like UA cuts
// down on false positives from that, not just from a 404.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36 CyprusTechCareersLinkChecker/1.0";

/** `http-404` / `http-410` are authoritative. `soft-404` is a guess from the
 *  page's own wording and is deliberately NOT treated as proof — see below. */
export type CheckReason = "http-404" | "http-410" | "soft-404" | null;

export interface LinkCheckResult {
  /** Authoritative: the server said 404 or 410. Safe to show as "Broken". */
  broken: boolean;
  /** Heuristic only: the page returned 200 but reads like a not-found page.
   *  Needs a human to look — must never be presented as a certainty. */
  suspect: boolean;
  status: number | null;
  reason: CheckReason;
}

/* Many career sites render their "job not found" page with an ordinary 200 —
   the listing is gone, but nothing about the HTTP layer says so. Caught this
   in practice on an Exness careers page: 200 status, page body reading
   "404 / Not found / Looks like the page does not exist or has been moved."

   This is a guess about someone else's markup, so it is scoped tightly:
   - Only <title> and <h1> are searched. <h2> was included originally and has
     been dropped — it is routinely an ordinary section heading, which makes it
     the most likely place for an innocent match.
   - Script, style, noscript and comment content is stripped before any tag is
     read. A client-rendered careers site ships its own "Page not found" string
     inside its JS bundle or serialised state, so matching raw HTML can flag a
     perfectly live listing on the strength of a string the visitor never sees.
   - A live job's own title or h1 essentially never contains this wording, so
     what is left is a low-noise signal — but it is still only a signal. */
const SOFT_404_PATTERNS = [
  /\b404\b/,
  /\bnot found\b/i,
  /page (?:does not exist|doesn'?t exist|no longer exists|cannot be found|could not be found)/i,
  /(?:job|position|role|vacancy|listing) (?:has been filled|is no longer available|has expired|has closed)/i,
];

/** Remove anything whose text is not visible page content. Without this, an
 *  SPA's bundled error-page copy is indistinguishable from the page actually
 *  saying it. */
function stripNonVisible(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ");
}

function extractTagText(html: string, tag: string): string {
  // The \b stops <h1…> from also matching a hypothetical <h10…>.
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
}

function looksLikeSoft404(html: string): boolean {
  const visible = stripNonVisible(html);
  const signal  = [extractTagText(visible, "title"), extractTagText(visible, "h1")].join(" ");
  return SOFT_404_PATTERNS.some(p => p.test(signal));
}

/**
 * Check whether a job's external "Apply" URL still resolves.
 *
 * Deliberately conservative on the HTTP layer: only a genuine 404 or 410
 * counts as broken. Career pages routinely 403 a non-browser request, time out
 * under load, or blip a 5xx — none of that means the listing closed, and
 * flagging on it would train the admin to ignore the warning. GET (not HEAD)
 * because a lot of ATS platforms 405 or misreport on HEAD — and because the
 * body is what the soft-404 check needs.
 *
 * The soft-404 heuristic returns `suspect`, never `broken`. It reads someone
 * else's markup and cannot be trusted to retire a live listing on its own;
 * two Bolt listings that were open in a browser came back flagged, which is
 * exactly the failure this separation prevents from being shown as fact.
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
      return {
        broken: true, suspect: false, status: res.status,
        reason: res.status === 404 ? "http-404" : "http-410",
      };
    }

    if (res.ok) {
      const html = await res.text();
      if (looksLikeSoft404(html)) {
        return { broken: false, suspect: true, status: res.status, reason: "soft-404" };
      }
    }

    return { broken: false, suspect: false, status: res.status, reason: null };
  } catch {
    // Network error, timeout, DNS failure, TLS failure, aborted redirect
    // chain — inconclusive. A page that's temporarily unreachable is not
    // the same thing as a listing the employer closed.
    return { broken: false, suspect: false, status: null, reason: null };
  } finally {
    clearTimeout(timeout);
  }
}
