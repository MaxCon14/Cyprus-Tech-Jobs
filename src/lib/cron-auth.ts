import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * Shared guard for scheduled endpoints.
 *
 * Each cron route used to inline `auth !== \`Bearer ${process.env.CRON_SECRET}\``.
 * With CRON_SECRET unset that comparison becomes the literal string
 * "Bearer undefined", so anyone sending exactly that header passed — one missing
 * environment variable away from letting strangers trigger the alert send or
 * the data purge. An unset secret now fails closed instead.
 */
export function authoriseCron(req: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const provided = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, which is itself a signal; compare
  // lengths first so every rejection costs the same.
  const ok = a.length === b.length && timingSafeEqual(a, b);

  return ok ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
