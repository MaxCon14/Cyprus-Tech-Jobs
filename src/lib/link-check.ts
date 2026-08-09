const CHECK_TIMEOUT_MS = 8000;

/* Why this identifies itself honestly, and why that is not the problem:

   A bare fetch's default UA gets blocked outright by some ATS front doors, so
   a browser-like prefix is worth having. The trailing token keeps it truthful
   — we are a link checker, not a browser, and pretending otherwise to get past
   a site that has decided to refuse bots is not a fight worth picking. It also
   would not reliably work: bot protection fingerprints the TLS handshake and
   header order, not just this string.

   The consequence is accepted deliberately: some sites will refuse us, and the
   answer is that a refusal is not evidence — see checkApplyUrl. */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36 CyprusTechCareersLinkChecker/1.0";

/* Sent because plenty of ordinary edge configs reject a request lacking them,
   which is a cheap class of false negative to remove. */
const REQUEST_HEADERS: Record<string, string> = {
  "User-Agent":      USER_AGENT,
  "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9",
};

/** Why a link was flagged. All values are advisory — see checkApplyUrl. */
export type CheckReason = "http-404" | "http-410" | "soft-404" | null;

export interface LinkCheckResult {
  /** Worth a human look. Deliberately NOT called "broken": this function
   *  cannot establish that a listing is dead, only that something looked
   *  wrong from a server in a datacenter. */
  flagged: boolean;
  status: number | null;
  reason: CheckReason;
}

/* Some career sites render "job not found" with an ordinary 200 — caught on an
   Exness page whose body read "404 / Not found" under a 200.

   Scoped tightly, because it is a guess about someone else's markup:
   - Only <title> and <h1>. <h2> is routinely an ordinary section heading, and
     "Not found what you were looking for? See all roles" is enough to condemn
     a live job.
   - Script, style, noscript and comments are stripped first. A client-rendered
     site ships its own error-page copy in its bundle or serialised state, and
     tag extraction takes the first match — which can be the bundle's. */
const SOFT_404_PATTERNS = [
  /\b404\b/,
  /\bnot found\b/i,
  /page (?:does not exist|doesn'?t exist|no longer exists|cannot be found|could not be found)/i,
  /(?:job|position|role|vacancy|listing) (?:has been filled|is no longer available|has expired|has closed)/i,
];

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
 * Look at a job's external "Apply" URL and report whether it is worth a human
 * checking. **This function cannot prove a listing is dead, and nothing built
 * on it may claim that it can.**
 *
 * That is not caution for its own sake — it is the conclusion from a real
 * case. Two Bolt listings were reported with an authoritative HTTP **404**
 * while both pages loaded perfectly in a browser. Bolt's edge serves automated
 * clients a 404: a stealth block, indistinguishable at this layer from a
 * genuinely retired posting. The request leaves a datacenter IP, without a
 * browser's TLS fingerprint, header order or JS, and a site that dislikes any
 * of that can answer however it likes.
 *
 * So every outcome here is a *signal*, and the admin UI presents all of them
 * as "check this", never as a verdict. The cost asymmetry drives it: acting on
 * a false positive unpublishes a live job an employer is paying for, while
 * acting on a false "check" costs one click.
 *
 * Still conservative about what even counts as a signal: only 404 and 410. A
 * 403, a 5xx, a timeout or a DNS failure are all left alone — career pages do
 * that routinely under load or to strangers, and flagging on it would train
 * the admin to ignore the column. GET rather than HEAD, because many ATS
 * platforms misreport on HEAD and because the soft-404 check needs the body.
 */
export async function checkApplyUrl(url: string): Promise<LinkCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: REQUEST_HEADERS,
    });

    if (res.status === 404 || res.status === 410) {
      return {
        flagged: true,
        status:  res.status,
        reason:  res.status === 404 ? "http-404" : "http-410",
      };
    }

    if (res.ok) {
      const html = await res.text();
      if (looksLikeSoft404(html)) {
        return { flagged: true, status: res.status, reason: "soft-404" };
      }
    }

    return { flagged: false, status: res.status, reason: null };
  } catch {
    // Network error, timeout, DNS failure, TLS failure, aborted redirect
    // chain — inconclusive. A page that's temporarily unreachable is not
    // the same thing as a listing the employer closed.
    return { flagged: false, status: null, reason: null };
  } finally {
    clearTimeout(timeout);
  }
}
