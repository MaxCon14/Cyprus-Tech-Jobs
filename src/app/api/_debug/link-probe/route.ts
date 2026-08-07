import { NextRequest, NextResponse } from "next/server";

/* TEMPORARY — diagnosing why a known-dead Exness apply URL isn't being
   caught by lib/link-check's soft-404 heuristic. Gated by a one-off literal
   key (not CRON_SECRET — this needs to be callable by URL alone with no way
   to set headers) so it isn't an open SSRF proxy. Delete this whole route
   once the soft-404 detection is fixed to actually catch it. */
const DEBUG_KEY = "13a182b53efc543245caeb7d42b2989f46950a1902b8cd1b";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const url = req.nextUrl.searchParams.get("url");
  if (key !== DEBUG_KEY) return new NextResponse(null, { status: 404 });
  if (!url) return NextResponse.json({ error: "missing url" }, { status: 400 });

  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,*/*",
    },
  });
  const html = await res.text();

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null;
  const h1s   = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, " ").trim());
  const h2s   = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, " ").trim());

  return NextResponse.json({
    finalUrl: res.url,
    status:   res.status,
    title,
    h1s,
    h2s,
    bodyLength: html.length,
    bodySnippet: html.slice(0, 4000),
  });
}
