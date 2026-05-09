import Link from "next/link";
import type { Metadata } from "next";
import { FAQAccordion } from "./FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ — CyprusTech.Jobs",
  description: "Frequently asked questions about CyprusTech.Jobs — for job seekers and employers.",
};

const FAQ_SECTIONS = [
  {
    title: "For job seekers",
    items: [
      {
        q: "Is CyprusTech.Jobs free to use?",
        a: "Yes, completely free for candidates. Browsing jobs, saving listings, setting up alerts, and applying are all free with no subscription required.",
      },
      {
        q: "How do I apply for a job?",
        a: "Click any job listing and hit the \"Apply for this role\" button. You'll be taken directly to the employer's application page. We don't process applications ourselves — the link goes straight to the employer.",
      },
      {
        q: "Do I need an account to apply?",
        a: "No account is needed to browse or apply. Creating a candidate account gives you extra features: saving jobs, tracking applications, getting personalised job alerts, and having your profile discoverable by employers.",
      },
      {
        q: "How do job alerts work?",
        a: "Subscribe to a job category or follow a specific company and we'll email you when matching new roles are posted. You can choose daily or weekly digests. Manage or cancel your alerts any time from your dashboard.",
      },
      {
        q: "Can I upload my CV?",
        a: "Yes — once you create a candidate account, you can upload your CV from your dashboard. Employers browsing the talent pool can then find your profile.",
      },
      {
        q: "How do I save a job?",
        a: "Hit the heart (♥) icon on any job listing. Saved jobs appear in your candidate dashboard so you can come back to them later.",
      },
      {
        q: "How do I unsubscribe from job alerts?",
        a: "Every alert email has an \"Unsubscribe from this alert\" link at the bottom. You can also manage or remove all your alerts from the My Alerts section of your candidate dashboard.",
      },
    ],
  },
  {
    title: "For employers",
    items: [
      {
        q: "How do I post a job?",
        a: (
          <>
            Create an employer account, purchase listing slots from the{" "}
            <Link href="/buy-credits" style={{ color: "var(--accent)", textDecoration: "none" }}>Buy credits</Link>
            {" "}page, then go to{" "}
            <Link href="/post-a-job" style={{ color: "var(--accent)", textDecoration: "none" }}>Post a job</Link>
            {" "}and fill in the details. Your listing goes live immediately.
          </>
        ),
      },
      {
        q: "How does pricing work?",
        a: "You pre-purchase listing slots — Standard or Featured. Each slot lets you publish one job. Slots don't expire, so buy in advance and use them whenever you're ready. Featured listings are promoted to the top of search results.",
      },
      {
        q: "How long does a listing stay active?",
        a: "Job listings are active for 30 days from the date they're posted. After that they're automatically marked as expired and removed from the public listing. You can re-post using another slot.",
      },
      {
        q: "Can I edit a listing after posting?",
        a: "Yes. From your employer dashboard, click Edit on any active listing to update the title, description, salary, or other details. The listing stays active and keeps its original post date.",
      },
      {
        q: "What's the difference between Standard and Featured?",
        a: "Standard listings appear in the regular job feed sorted by date. Featured listings are pinned to the top of the feed and marked with a \"Featured\" badge, giving them significantly more visibility.",
      },
      {
        q: "What happens if I buy slots but don't use them all?",
        a: "Unused slots stay on your account with no expiry date. Use them whenever you have a new role to fill.",
      },
      {
        q: "Can I see who's applied or saved my job?",
        a: "Applications are handled externally (via your own apply link), so we don't track who applies. We're working on additional employer insights — stay tuned.",
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        q: "What kind of jobs are listed?",
        a: "CyprusTech.Jobs focuses exclusively on technology roles in Cyprus — software engineering, DevOps, design, data, product, QA, security, and more. Both on-site and remote roles are listed.",
      },
      {
        q: "Are the jobs only in Cyprus?",
        a: "Most roles are based in Cyprus (Limassol, Nicosia, Larnaca, Paphos), but we also list remote positions open to Cyprus-based candidates.",
      },
      {
        q: "How do I report an incorrect or fraudulent listing?",
        a: (
          <>
            Contact us at{" "}
            <a href="mailto:help@cyprustech.careers" style={{ color: "var(--accent)", textDecoration: "none" }}>
              help@cyprustech.careers
            </a>
            {" "}or use our{" "}
            <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none" }}>contact form</Link>
            . We review all reports and remove listings that violate our policies.
          </>
        ),
      },
      {
        q: "I have a question that isn't answered here.",
        a: (
          <>
            Reach out via our{" "}
            <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none" }}>contact page</Link>
            {" "}or email us directly at{" "}
            <a href="mailto:help@cyprustech.careers" style={{ color: "var(--accent)", textDecoration: "none" }}>
              help@cyprustech.careers
            </a>
            . We typically reply within one business day.
          </>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "clamp(48px, 8vw, 80px) var(--page-padding-x)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p className="mono-s" style={{ color: "var(--accent)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            FAQ
          </p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "clamp(28px, 5vw, 40px)", color: "var(--text)", lineHeight: 1.15, marginBottom: 16 }}>
            Frequently asked questions
          </h1>
          <p className="body" style={{ color: "var(--text-muted)", lineHeight: 1.65 }}>
            Can't find what you're looking for?{" "}
            <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
              Contact us
            </Link>{" "}
            and we'll help.
          </p>
        </div>

        <FAQAccordion sections={FAQ_SECTIONS} />

      </div>
    </div>
  );
}
