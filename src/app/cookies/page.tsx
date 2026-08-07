import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { CookiePreferences } from "@/components/legal/CookiePreferences";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie Policy — CyprusTech.Careers",
  description:
    "Which cookies and similar technologies CyprusTech.Careers uses, what each one does, and how to control them, including optional analytics you can accept or decline.",
  alternates: { canonical: `${SITE_URL}/cookies` },
  openGraph: {
    title: "Cookie Policy — CyprusTech.Careers",
    description: "Which cookies CyprusTech.Careers uses and how to control them.",
    url: `${SITE_URL}/cookies`,
    type: "website",
  },
};

const SECTIONS: LegalSection[] = [
  {
    id: "summary",
    heading: "The short version",
    blocks: [
      {
        type: "note",
        text: "We set one strictly necessary cookie — the one that keeps you signed in — unconditionally. We also use Google Analytics, which is not strictly necessary and sets cookies of its own, but only if you accept it: it defaults to off for every visitor and only turns on if you say yes in the notice at the bottom of the page or the control below. We do not use advertising cookies, tracking pixels or marketing trackers, and we do not sell or share browsing data.",
      },
      {
        type: "p",
        text: "EU rules require consent for cookies that are not strictly necessary. That's why the notice at the bottom of the page is a real Accept/Reject choice rather than a plain acknowledgment: Google Analytics does not run, and sets nothing in your browser, until you accept it. You can change your mind at any time using the control below — it takes effect immediately, no page reload needed.",
      },
      {
        type: "p",
        text: "This policy explains what is actually stored in your browser when you use the site, and what you can do about it. It sits alongside our Privacy Policy, which covers personal data more broadly.",
      },
    ],
  },
  {
    id: "what-they-are",
    heading: "What cookies are",
    blocks: [
      {
        type: "p",
        text: "A cookie is a small file a website asks your browser to keep, and which the browser sends back on later visits. It is what lets a site recognise you between page loads. Related technologies such as local storage do a similar job by keeping data in the browser without sending it anywhere.",
      },
      {
        type: "p",
        text: "Under EU rules, cookies that are strictly necessary to deliver a service you asked for do not require consent. Anything else — advertising or non-essential analytics — does. We only use the first kind.",
      },
    ],
  },
  {
    id: "what-we-use",
    heading: "Cookies we use",
    blocks: [
      {
        type: "table",
        head: ["Cookie", "Purpose", "Type", "Expires"],
        rows: [
          [
            "sb-*-auth-token",
            "Keeps you signed in after you enter your sign-in code, and tells the server which account is making a request. Set by Supabase, our authentication provider. Without it you would be signed out on every page load.",
            "Strictly necessary",
            "On sign-out, or when the session expires",
          ],
          [
            "_ga",
            "Distinguishes visitors for Google Analytics. Only set if you accept analytics — see below.",
            "Analytics (consent required)",
            "2 years",
          ],
          [
            "_ga_MGNJW82FYC",
            "Persists your Google Analytics session state between page loads. Only set if you accept analytics.",
            "Analytics (consent required)",
            "2 years",
          ],
        ],
      },
      {
        type: "p",
        text: "The Supabase cookie's exact name carries an identifier for our project, and the value may be split across a few numbered cookies when it is long. All cookies in this table are first-party — set for cyprustech.careers, not a third-party domain — and the Analytics ones are set by Google's script running on our page, not by Google directly.",
      },
      {
        type: "p",
        text: "If you never sign in and decline analytics, we set no cookie at all. Browsing jobs anonymously stores nothing in your browser on our behalf beyond your choice itself (see Local storage below) — see Third parties for the requests your browser makes to other companies while loading a page.",
      },
    ],
  },
  {
    id: "local-storage",
    heading: "Local storage",
    blocks: [
      {
        type: "table",
        head: ["Item", "Purpose", "Expires"],
        rows: [
          [
            "Onboarding draft",
            "While you are filling in the job seeker or employer sign-up wizard, your answers so far are saved in your browser so a refresh or an accidental back button does not lose them. It never leaves your device until you submit the form.",
            "Cleared when you finish the wizard, or when you clear site data",
          ],
          [
            "Cookie preference",
            "Records your analytics choice — accepted or declined — so the notice is not shown again on every visit and your decision is respected going forward. Stores a version number, the date, and whether you accepted or declined; nothing else about you.",
            "Kept until you clear site data, or change your mind using the control on this page",
          ],
        ],
      },
    ],
  },
  {
    id: "analytics",
    heading: "Analytics",
    blocks: [
      {
        type: "p",
        text: "We use Vercel Web Analytics and Vercel Speed Insights to see which pages are visited and how quickly they load. Both are cookieless: they set nothing in your browser, do not build a profile of you, and do not follow you to other sites. What we get back is aggregate — page view counts and performance timings, not a record of what any individual did. These are strictly necessary in the sense that they identify no one, so they run for every visitor.",
      },
      {
        type: "p",
        text: "We also use Google Analytics (GA4) for more detailed usage reporting — which pages, how people navigate the site, and where visitors come from. This is not cookieless: it sets the cookies listed above and can build a profile of your visit. It is not strictly necessary, so — unlike Vercel Analytics — it does not run by default. It only activates if you accept it, using Google's own Consent Mode: nothing is sent to Google and no cookie is set until you say yes, and declining (or doing nothing) keeps it off.",
      },
      {
        type: "note",
        text: "You can check or change your Google Analytics choice at any time using the control at the top of this page — it applies immediately, without needing to clear your browser or wait for the notice to reappear.",
      },
      {
        type: "p",
        text: "We also count how many times each job listing is clicked through to, so employers can see how their listings are performing. That count is a number attached to the listing, not to you.",
      },
    ],
  },
  {
    id: "third-parties",
    heading: "Third parties",
    blocks: [
      {
        type: "p",
        text: "No advertising network, social media tracker or marketing pixel runs on this site.",
      },
      {
        type: "p",
        text: "Some images are served from other companies' networks. Technology logos on job listings come from cdn.simpleicons.org and cdn.jsdelivr.net. As with any image on the web, loading one tells the host your IP address and which page requested it. They set no cookies for us and we send them nothing about you, but the request itself is visible to them.",
      },
      {
        type: "p",
        text: "When an employer buys listing slots, we send them to Stripe's own checkout pages to pay. Stripe may set cookies on its own domain to process the payment and prevent fraud. Those are governed by Stripe's cookie policy, not ours, and the payment pages are not part of this site.",
      },
      {
        type: "p",
        text: "Job listings can link out to employers' own websites and application forms. Once you follow such a link you are on someone else's site, subject to their cookie practices.",
      },
    ],
  },
  {
    id: "managing",
    heading: "Controlling cookies",
    blocks: [
      {
        type: "p",
        text: "Every browser lets you view and delete cookies and local storage, and block them for a given site — usually under Settings, then Privacy. You can also browse in a private window, which discards everything at the end of the session.",
      },
      {
        type: "note",
        text: "Blocking cookies for this site means you will not be able to stay signed in — that's the one cookie we can't make optional. Browsing and searching jobs will still work perfectly well either way, and declining analytics through the control on this page has no effect on anything else the site does.",
      },
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "If we add anything that stores data in your browser, we will update this page before it goes live, and if it is not strictly necessary we will ask for your consent first. The date at the top shows the current version.",
      },
      { type: "p", text: `Questions: ${CONTACT_EMAIL}.` },
    ],
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Policy"
      intro={`What ${SITE_NAME} stores in your browser, and what it is for.`}
      sections={SECTIONS}
      current="/cookies"
    >
      <CookiePreferences />
    </LegalPage>
  );
}
