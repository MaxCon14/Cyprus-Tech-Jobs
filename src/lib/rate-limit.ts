import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Fixed-window rate limiting for endpoints that anyone can call.
 *
 * Counters live in Postgres, not in module scope: serverless instances do not
 * share memory, so an in-process Map would let each cold start begin again from
 * zero and limit nothing in practice. The increment happens inside a single
 * statement in consume_rate_limit(), so two simultaneous requests cannot both
 * read a stale count and slip through.
 */

/** Best-effort client identity. Vercel sets x-forwarded-for at the edge. */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export type RateLimitRule = {
  /** Distinguishes counters for different endpoints sharing one identifier. */
  name: string;
  limit: number;
  windowSeconds: number;
};

/**
 * @returns true when the caller is within the limit.
 *
 * Fails open. A database that cannot serve this counter cannot serve the
 * request behind it either, so refusing here would turn an outage into a
 * confusing error rather than preventing any abuse.
 */
export async function allowRequest(identifier: string, rule: RateLimitRule): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
      p_key:            `${rule.name}:${identifier}`,
      p_window_seconds: rule.windowSeconds,
      p_limit:          rule.limit,
    });
    if (error) {
      console.error("[rate-limit]", rule.name, error.message);
      return true;
    }
    return data !== false;
  } catch (err) {
    console.error("[rate-limit]", rule.name, err);
    return true;
  }
}

/** 429 with Retry-After, so a client that respects it can back off properly. */
export function tooManyRequests(rule: RateLimitRule, message: string) {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(rule.windowSeconds) } },
  );
}

/** Guards a whole route by IP. Returns a response to send, or null to continue. */
export async function enforceIpLimit(
  req: NextRequest,
  rule: RateLimitRule,
  message: string,
): Promise<NextResponse | null> {
  return (await allowRequest(clientIp(req), rule)) ? null : tooManyRequests(rule, message);
}
