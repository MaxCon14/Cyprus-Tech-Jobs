import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.jobs";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/employers/dashboard"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
