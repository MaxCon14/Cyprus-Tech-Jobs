import { NextRequest, NextResponse } from "next/server";
import { checkApplyUrl } from "@/lib/link-check";

/* TEMPORARY — round 3. Round 3 confirmed checkApplyUrl gets a clean 200 in
   ~200ms (no timeout), reason: null — the soft-404 title/h1/h2 match just
   isn't firing. This adds the raw title/h1/h2/snippet back so I can see
   what the page is actually sending right now. Delete once diagnosed. */
const DEBUG_KEY = "9f2c7a41e6b083d5f9a417c02e8b6d3a51f7c9e0b4a2d8f6";

export const dynamic = "force-dynamic";

function extractTagText(html: string, tag: string): string[] {
  return [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))]
    .map(m => m[1].replace(/<[^>]+>/g, " ").trim());
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const url = req.nextUrl.searchParams.get("url");
  if (key !== DEBUG_KEY) return new NextResponse(null, { status: 404 });
  if (!url) return NextResponse.json({ error: "missing url" }, { status: 400 });

  const startedAt = Date.now();
  const result = await checkApplyUrl(url);
  const elapsedMs = Date.now() - startedAt;

  // Separately fetch again to inspect the raw HTML — checkApplyUrl doesn't
  // hand its body back out.
  const res  = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,*/*",
    },
    redirect: "follow",
  });
  const html = await res.text();

  return NextResponse.json({
    url, elapsedMs, ...result,
    rawStatus: res.status,
    finalUrl:  res.url,
    title: extractTagText(html, "title"),
    h1: extractTagText(html, "h1"),
    h2: extractTagText(html, "h2"),
    bodyLength: html.length,
    bodySnippet: html.slice(0, 3000),
  });
}
