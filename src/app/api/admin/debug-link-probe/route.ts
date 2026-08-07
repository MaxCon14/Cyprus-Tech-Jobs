import { NextRequest, NextResponse } from "next/server";
import { checkApplyUrl } from "@/lib/link-check";

/* TEMPORARY — round 2. Round 1 showed a manual fetch to the Exness URL
   returning a real 404, but the actual admin "Check apply links" run right
   after still came back clean. This calls the exact same checkApplyUrl the
   production route uses (not a hand-rolled equivalent) and reports timing,
   to see whether it's timing out against the 8s limit rather than getting a
   clean answer. Delete once diagnosed. */
const DEBUG_KEY = "9f2c7a41e6b083d5f9a417c02e8b6d3a51f7c9e0b4a2d8f6";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const url = req.nextUrl.searchParams.get("url");
  if (key !== DEBUG_KEY) return new NextResponse(null, { status: 404 });
  if (!url) return NextResponse.json({ error: "missing url" }, { status: 400 });

  const startedAt = Date.now();
  const result = await checkApplyUrl(url);
  const elapsedMs = Date.now() - startedAt;

  return NextResponse.json({ url, elapsedMs, ...result });
}
