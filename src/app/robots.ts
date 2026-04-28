import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.jobs";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/candidates/dashboard", "/employers/dashboard"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
