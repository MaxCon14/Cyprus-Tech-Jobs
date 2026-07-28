import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifies a Svix-signed webhook (the scheme Resend uses).
 *
 * Written out rather than pulling in the `svix` package: it is one HMAC, and a
 * dependency added for that is a dependency to keep patched.
 *
 * The signature covers `id.timestamp.body`, so the raw body must be passed
 * exactly as received — re-serialising parsed JSON changes the bytes and every
 * signature then fails.
 */

/** Reject anything older than this, so a captured request cannot be replayed. */
const TOLERANCE_SECONDS = 5 * 60;

export type SvixResult =
  | { ok: true }
  | { ok: false; reason: string };

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  // timingSafeEqual throws when lengths differ, so check that first and keep
  // every rejection the same cost.
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function verifySvixSignature({
  secret,
  body,
  id,
  timestamp,
  signature,
  now = Date.now(),
}: {
  secret:    string;
  body:      string;
  id:        string | null;
  timestamp: string | null;
  signature: string | null;
  now?:      number;
}): SvixResult {
  if (!secret)                       return { ok: false, reason: "secret not configured" };
  if (!id || !timestamp || !signature) return { ok: false, reason: "missing svix headers" };

  const sent = Number(timestamp);
  if (!Number.isFinite(sent)) return { ok: false, reason: "bad timestamp" };
  if (Math.abs(now / 1000 - sent) > TOLERANCE_SECONDS) {
    return { ok: false, reason: "timestamp outside tolerance" };
  }

  // Secrets are issued as whsec_<base64>; the prefix is not part of the key.
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");

  /* The header carries a space-separated list so a secret can be rotated with
     both signatures live; any one matching is a pass. */
  const provided = signature
    .split(" ")
    .map(part => part.split(","))
    .filter(([version]) => version === "v1")
    .map(([, sig]) => sig)
    .filter(Boolean) as string[];

  if (provided.length === 0) return { ok: false, reason: "no v1 signature present" };

  return provided.some(sig => safeEqual(sig, expected))
    ? { ok: true }
    : { ok: false, reason: "signature mismatch" };
}
