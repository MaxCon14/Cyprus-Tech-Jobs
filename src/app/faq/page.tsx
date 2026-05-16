import Link from "next/link";
import type { Metadata } from "next";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { buildFAQSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ — CyprusTech.Jobs Help & Support",
  description: "Frequently asked questions about CyprusTech.Jobs for job seekers and employers. Learn how to post a job, apply, set alerts, and more.",
  alternates: { canonical: "https://cyprustech.careers/faq" },
  openGraph: {
    title: "FAQ — CyprusTech.Jobs Help & Support",
    description: "Frequently asked questions about CyprusTech.Jobs for job seekers and employers.",
    url: "https://cyprustech.careers/faq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — CyprusTech.Jobs",
    description: "Frequently asked questions about CyprusTech.Jobs for job seekers and employers.",
  },
};

const FAQS = [
  // For job seekers
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
    q: "How do I save a job?",
    a: "Hit the heart (♥) icon on any job listing. Saved jobs appear in your candidate dashboard so you can come back to them later.",
  },
  {
    q: "How do I unsubscribe from job alerts?",
    a: "Every alert email has an \"Unsubscribe from this alert\" link at the bottom. You can also manage or remove all your alerts from the My Alerts section of your candidate dashboard.",
  },
  // For employers
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
  // General
  {
    q: "What kind of jobs are listed?",
    a: "CyprusTech.Jobs focuses exclusively on technology roles in Cyprus — software engineering, DevOps, design, data, product, QA, security, and more. Both on-site and remote roles are listed.",
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
];

const PLAIN_TEXT_FAQS = FAQS.filter(f => typeof f.a === "string") as { q: string; a: string }[];

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema(PLAIN_TEXT_FAQS.map(f => ({ question: f.q, answer: f.a })))) }}
      />
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", background: "var(--bg-alt)", minHeight: "100vh" }}>
      <div className="page-container">
        <div style={{ maxWidth: 780, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "clamp(28px, 4vw, 44px)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>FAQ</div>
            <h1 className="display-m" style={{ marginBottom: 12 }}>Frequently asked questions</h1>
            <p className="body" style={{ color: "var(--text-muted)" }}>
              Can&apos;t find what you&apos;re looking for?{" "}
              <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                Contact us
              </Link>{" "}
              and we&apos;ll help.
            </p>
          </div>

          <FaqAccordion faqs={FAQS} />

        </div>
      </div>
    </section>
    </>
  );
}
