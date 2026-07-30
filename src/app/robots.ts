import type { MetadataRoute } from "next";

/* Private/app areas no crawler should index. Shared by every user-agent rule
   below so the AI crawlers get the same treatment as everyone else. */
const DISALLOW = [
  "/api/",
  "/admin/",
  "/employers/dashboard",
  "/candidates/dashboard",
  "/dashboard",
  "/login",
  "/get-started",
  "/buy-credits",
  "/style-guide",
  "/_next/",
];

/* AI crawlers we deliberately welcome (GEO): the answer engines and their
   training/search bots. Naming them explicitly is an intentional opt-in — some
   sites block these, so we state clearly that ours may be read and cited. */
const AI_CRAWLERS = [
  "GPTBot",           // OpenAI — model training
  "OAI-SearchBot",    // OpenAI — ChatGPT Search index
  "ChatGPT-User",     // OpenAI — live fetch when a user asks
  "ClaudeBot",        // Anthropic — crawler
  "anthropic-ai",     // Anthropic
  "Claude-Web",       // Anthropic — live fetch
  "PerplexityBot",    // Perplexity — index
  "Perplexity-User",  // Perplexity — live fetch
  "Google-Extended",  // Google — Gemini / Vertex generative use
  "Applebot-Extended",// Apple — generative use
  "CCBot",            // Common Crawl (feeds many models)
  "cohere-ai",        // Cohere
];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.careers";

  return {
    rules: [
      { userAgent: "*",          allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS,  allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
