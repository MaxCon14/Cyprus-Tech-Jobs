/**
 * Google Indexing API integration.
 *
 * Notifies Google immediately when a job is published, updated, paused,
 * closed, or expired — so it appears in (or is removed from) Google Jobs
 * results within minutes rather than days.
 *
 * Setup required (in .env.local / Vercel env vars):
 *   GOOGLE_INDEXING_CLIENT_EMAIL  — service account email
 *   GOOGLE_INDEXING_PRIVATE_KEY   — service account private key (PEM, \n escaped)
 *
 * How to obtain credentials:
 *   1. Create a Google Cloud project and enable the "Web Search Indexing API"
 *   2. Create a Service Account; download the JSON key
 *   3. In Google Search Console → Settings → Users & permissions, add the
 *      service account email as an "Owner"
 *   4. Set the two env vars from the JSON key file
 */

import crypto from "crypto";

const TOKEN_URL   = "https://oauth2.googleapis.com/token";
const INDEXING_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const SCOPE       = "https://www.googleapis.com/auth/indexing";
const BASE_URL    = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.careers";

export type IndexingAction = "URL_UPDATED" | "URL_DELETED";

function b64url(data: string | Buffer): string {
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return buf.toString("base64url");
}

async function getAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
  const privateKey  = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const header  = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const toSign = `${header}.${payload}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(toSign);
  const sig = b64url(sign.sign(privateKey));

  const jwt = `${toSign}.${sig}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    console.warn("[google-indexing] token exchange failed:", res.status);
    return null;
  }
  const data = await res.json() as { access_token?: string };
  return data.access_token ?? null;
}

/**
 * Ping Google Indexing API for a job posting URL.
 * Fails silently — never throws, never blocks the caller.
 *
 * @param slug  The job slug (e.g. "senior-react-dev-at-druuuble")
 * @param action  URL_UPDATED when live; URL_DELETED when removed/expired/paused
 */
export async function notifyGoogle(slug: string, action: IndexingAction): Promise<void> {
  try {
    const token = await getAccessToken();
    if (!token) return;

    const url = `${BASE_URL}/jobs/${slug}`;
    const res = await fetch(INDEXING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ url, type: action }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`[google-indexing] ${action} ${slug} → ${res.status}:`, body);
    } else {
      console.log(`[google-indexing] ${action} ${url}`);
    }
  } catch (err) {
    console.warn("[google-indexing] error:", err);
  }
}

/**
 * Notify Google for multiple slugs in parallel (used by cron).
 */
export async function notifyGoogleBatch(slugs: string[], action: IndexingAction): Promise<void> {
  await Promise.allSettled(slugs.map(s => notifyGoogle(s, action)));
}
