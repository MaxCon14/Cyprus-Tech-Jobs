import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.careers";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/employers/dashboard",
          "/candidates/dashboard",
          "/dashboard",
          "/login",
          "/get-started",
          "/buy-credits",
          "/_next/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
