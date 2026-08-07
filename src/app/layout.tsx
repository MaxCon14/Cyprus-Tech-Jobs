import { Suspense } from "react";
import type { Metadata } from "next";
import { Figtree, Fragment_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { FooterConditional } from "@/components/layout/FooterConditional";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { CookieNotice } from "@/components/layout/CookieNotice";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { GoogleAnalyticsPageview } from "@/components/analytics/GoogleAnalyticsPageview";
import { getNavCategories } from "@/lib/queries";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tech Jobs in Cyprus | CyprusTech.Careers",
    template: "%s | CyprusTech.Careers",
  },
  description:
    "The home for tech jobs in Cyprus. Find roles at the best companies in Limassol, Nicosia, Larnaca and beyond — or post a job to reach Cyprus's top tech talent.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.careers"),
  // Favicon comes from the file-convention icons in this folder — favicon.ico
  // (16/32/48), icon.svg and apple-icon.png, all generated from the brand logo.
  // (The previous /logo.svg was 628×576, so Google rejected it as non-square.)
  openGraph: {
    siteName: "CyprusTech.Careers",
    type: "website",
    locale: "en_CY",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CyprusTech.Careers — Tech Jobs in Cyprus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@CyprusTechCareers",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* The nav's category menu comes from the database so it can never disagree
     with the filters it links to. The read is cached and tag-revalidated, so
     this is not a query per page view. */
  const navCategories = await getNavCategories();

  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fragmentMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Warm up connections to the third-party icon/logo CDNs so their
            DNS/TLS handshakes overlap with the initial render. */}
        <link rel="preconnect" href="https://cdn.simpleicons.org" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col antialiased" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <Providers>
          <Nav categories={navCategories} />
          <main className="flex-1">{children}</main>
          <FooterConditional><Footer /></FooterConditional>
        </Providers>
        <CookieNotice />
        <GoogleAnalytics />
        {/* useSearchParams requires a Suspense boundary in the App Router,
            or the build opts the whole tree out of static rendering. */}
        <Suspense fallback={null}>
          <GoogleAnalyticsPageview />
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
