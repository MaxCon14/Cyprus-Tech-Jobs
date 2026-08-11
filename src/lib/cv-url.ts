/**
 * Allowlist for the CV URLs the AI endpoints are willing to fetch.
 *
 * `parse-cv` and `cv-review` both took a URL from the request body and fetched
 * it, unauthenticated, then returned Claude's reading of whatever came back.
 * That is an SSRF read primitive: anyone could point either endpoint at an
 * internal address and get the response described back to them.
 *
 * Requiring a sign-in is not the fix — it would break the feature. `parse-cv`
 * runs at step 7 of candidate onboarding, before verification at step 8, and
 * `cv-review` sits on public job pages. Both legitimately serve people without
 * accounts. What is true, though, is that a real CV has always come from our
 * own storage: `cv-upload` puts it in the public `cvs` bucket and hands back
 * that URL. So the URL never needs to be arbitrary, and pinning it to that one
 * bucket closes the hole without touching the guest flow.
 *
 * Redirect handling is deliberately left at fetch's default. With the host and
 * path pinned, the only thing reachable is a static object in our own public
 * bucket — object storage does not issue redirects to attacker-chosen hosts,
 * so there is no chain to follow out of the allowlist.
 */

const ALLOWED_PATH_PREFIX = "/storage/v1/object/public/cvs/";

export type CvUrlCheck =
  | { ok: true;  url: string }
  | { ok: false; reason: string };

/**
 * Fails **closed**: an unset or unparseable `NEXT_PUBLIC_SUPABASE_URL` means
 * we cannot say what is safe, so nothing is. That is the opposite of
 * `rate-limit.ts`, which fails open on purpose — a broken counter should not
 * take the site down, but a broken allowlist must not wave requests through.
 */
export function checkCvUrl(raw: string): CvUrlCheck {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return { ok: false, reason: "storage host is not configured" };
  }

  let allowedHost: string;
  try {
    allowedHost = new URL(supabaseUrl).hostname;
  } catch {
    return { ok: false, reason: "storage host is not configured" };
  }

  const candidate = raw.trim();
  if (!candidate) return { ok: false, reason: "empty" };

  /* The routes used to prepend https:// to anything without a scheme. Keep
     that convenience, but parse before trusting any of it. */
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
  } catch {
    return { ok: false, reason: "not a valid URL" };
  }

  if (url.protocol !== "https:")           return { ok: false, reason: "not https" };
  // Credentials in a URL are never present on a real storage link and are a
  // classic way to make a host look like one thing and resolve as another.
  if (url.username || url.password)        return { ok: false, reason: "credentials in URL" };
  if (url.hostname !== allowedHost)        return { ok: false, reason: "host not allowed" };
  if (!url.pathname.startsWith(ALLOWED_PATH_PREFIX)) {
    return { ok: false, reason: "not a CV object" };
  }

  return { ok: true, url: url.toString() };
}
