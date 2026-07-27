import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import {
  SITE_NAME, SITE_URL, CONTACT_EMAIL, DPA, operatorLabel, registrationLine, addressLine,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — CyprusTech.Careers",
  description:
    "How CyprusTech.Careers collects, uses, shares and protects personal data of job seekers and employers, and how to exercise your rights under the GDPR.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "Privacy Policy — CyprusTech.Careers",
    description: "How we handle personal data of job seekers and employers under the GDPR.",
    url: `${SITE_URL}/privacy`,
    type: "website",
  },
};

const controllerLines = [
  `${operatorLabel()} operates this site and is the data controller for personal data described in this policy.`,
  registrationLine(),
  addressLine(),
  `You can reach us about anything in this policy at ${CONTACT_EMAIL}.`,
].filter(Boolean);

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "Who we are",
    blocks: [
      { type: "p", text: controllerLines.join(" ") },
      {
        type: "p",
        text:
          "This policy covers cyprustech.careers, a job board for technology roles in Cyprus. It explains what we collect, why, who we share it with, and what you can ask us to do about it. It applies to job seekers, employers, and anyone who simply browses the site.",
      },
    ],
  },
  {
    id: "what-we-collect",
    heading: "What we collect",
    blocks: [
      {
        type: "h3",
        text: "If you create a job seeker account",
      },
      {
        type: "p",
        text: "We store the profile you build during onboarding and can edit at any time afterwards:",
      },
      {
        type: "ul",
        items: [
          "Your email address, and first and last name if you give them.",
          "Profile details: headline, bio, profile photo, city, remote working preference, experience level, skills, and the job categories you are interested in.",
          "Minimum salary expectation, if you set one.",
          "Links you choose to add: LinkedIn, GitHub, portfolio, Dribbble, Behance and X/Twitter.",
          "Your CV, uploaded as a PDF, plus any work history extracted from it.",
          "Cover letters you write or upload when applying.",
          "Jobs you save, jobs you apply to, and the applications you submit through the site.",
          "Your job alert preferences and how often you want to hear from us.",
        ],
      },
      { type: "h3", text: "If you create an employer account" },
      {
        type: "ul",
        items: [
          "Your email address and name.",
          "Your company profile: name, description, logo, website and related details shown on your listings.",
          "The job listings you publish and the applications they receive.",
          "Your purchase history and listing slot balance. Card details are handled entirely by Stripe and never reach our servers.",
        ],
      },
      { type: "h3", text: "If you only subscribe to job alerts" },
      {
        type: "p",
        text: "We store your email address, optionally your first name, and the filters you chose, so we can send the digest you asked for. No account is required.",
      },
      { type: "h3", text: "If you just browse" },
      {
        type: "p",
        text: "We record aggregate usage of the site and a count of how many times each listing is clicked through to. This is not tied to your identity and is used to tell employers how their listings are performing and to work out which pages need attention.",
      },
    ],
  },
  {
    id: "why-we-use-it",
    heading: "Why we use it, and our legal basis",
    blocks: [
      {
        type: "p",
        text: "Under the GDPR we need a lawful basis for each use of your data. Ours are as follows.",
      },
      {
        type: "table",
        head: ["What we do", "Why", "Legal basis"],
        rows: [
          ["Run your account and sign you in", "You cannot use an account without it", "Performance of a contract"],
          ["Show your profile and CV to an employer when you apply", "That is the point of applying", "Performance of a contract"],
          ["Publish job listings and take payment for slots", "To provide the employer service", "Performance of a contract"],
          ["Send job alert emails", "You asked for them", "Consent — withdraw any time"],
          ["Analyse your CV when you request a review", "You asked for the review", "Consent — withdraw any time"],
          ["Send service emails such as sign-in codes and receipts", "You cannot use the service without them", "Performance of a contract"],
          ["Aggregate usage statistics and click counts", "To keep the site working and useful", "Legitimate interests"],
          ["Prevent fraud, spam and abuse of listings", "To protect users and the service", "Legitimate interests"],
          ["Meet accounting and tax obligations", "Required by law", "Legal obligation"],
        ],
      },
    ],
  },
  {
    id: "cv-analysis",
    heading: "CV parsing and CV review",
    blocks: [
      {
        type: "p",
        text: "The site offers two optional features that read your CV: automatic extraction of your work history when you upload it, and an on-demand CV review that gives you written feedback.",
      },
      {
        type: "p",
        text: "Both work by sending your CV as a PDF to Anthropic, which operates the Claude AI models, and returning the result to you. Your CV is sent only when you upload it or ask for a review. If you would rather it were never sent, do not upload a CV and do not request a review — the rest of the site works without either.",
      },
      {
        type: "note",
        text: "These features are assistive only. No decision about your application is made automatically, and no employer sees a score or ranking produced by them. Employers read your actual profile and CV and decide for themselves.",
      },
    ],
  },
  {
    id: "who-we-share-with",
    heading: "Who we share it with",
    blocks: [
      {
        type: "p",
        text: "We do not sell personal data. We share it with employers when you choose to apply, and with the service providers below who process data on our instructions.",
      },
      {
        type: "table",
        head: ["Provider", "What it handles", "Where"],
        rows: [
          ["Supabase", "Database, file storage and sign-in", "EU (Ireland)"],
          ["Vercel", "Website hosting and aggregate analytics", "EU region for serving; US company"],
          ["Resend", "Transactional and job alert email", "EU (Ireland)"],
          ["Stripe", "Card payments for listing slots", "EU / US"],
          ["Anthropic", "CV parsing and CV review, only when used", "US"],
          ["Google", "Notified of job listing URLs for search indexing. No personal data is sent", "US"],
        ],
      },
      {
        type: "p",
        text: "When you apply for a job, the employer that posted it receives your profile, your CV and your cover letter. From that point the employer is an independent controller of that copy and handles it under its own privacy policy. We cannot delete data an employer has already downloaded, though we will pass on a request if you ask.",
      },
      {
        type: "p",
        text: "Some providers are based outside the European Economic Area. Where that is the case, transfers rely on the European Commission's Standard Contractual Clauses or an equivalent safeguard.",
      },
    ],
  },
  {
    id: "how-long",
    heading: "How long we keep it",
    blocks: [
      {
        type: "ul",
        items: [
          "Account data: for as long as your account exists. Delete your account and we remove your profile, CV and cover letters.",
          "Applications: retained while your account exists so you can see your history. The employer keeps its own copy independently.",
          "Applications made without an account: deleted automatically 30 days after your last application — the details you entered, your CV, your cover letter and the uploaded files themselves. Nothing is kept, and applying this way never signs you up for anything. Create an account before then and your applications stay with it.",
          "Job alerts: until you unsubscribe, which every alert email links to.",
          "Job listings: published for 30 days, then expired. Expired listings are kept as part of the employer's account history.",
          "Payment and invoice records: kept for as long as accounting and tax law requires, normally six years.",
          "Aggregate usage statistics: kept indefinitely, because they contain nothing that identifies you.",
        ],
      },
    ],
  },
  {
    id: "your-rights",
    heading: "Your rights",
    blocks: [
      {
        type: "p",
        text: "Under the GDPR you can ask us to do any of the following, free of charge, and we will respond within one month.",
      },
      {
        type: "ul",
        items: [
          "Access — get a copy of the personal data we hold about you.",
          "Rectification — correct anything inaccurate. Most of it you can edit yourself from your dashboard.",
          "Erasure — delete your account and the data attached to it.",
          "Portability — receive your data in a machine-readable format, or have it sent to another service.",
          "Restriction — ask us to pause processing while a dispute is resolved.",
          "Objection — object to processing we base on legitimate interests.",
          "Withdraw consent — for job alerts and CV analysis, at any time, without affecting what was lawful beforehand.",
        ],
      },
      {
        type: "p",
        text: `To exercise any of these, email ${CONTACT_EMAIL} from the address on your account.`,
      },
      {
        type: "p",
        text: `If you think we have handled your data badly, please tell us first so we can fix it. You also have the right to complain to the ${DPA.name} in ${DPA.country} at ${DPA.url}, or to the supervisory authority where you live.`,
      },
    ],
  },
  {
    id: "security",
    heading: "Security",
    blocks: [
      {
        type: "p",
        text: "Traffic to the site is encrypted in transit. Sign-in uses a single-use code sent to your email rather than a stored password, so there is no password of yours for us to lose. Access to production data is limited to people who need it to run the service.",
      },
      {
        type: "p",
        text: "No service can promise perfect security. If a breach affects your personal data and is likely to put your rights at risk, we will notify you and the supervisory authority as the GDPR requires.",
      },
    ],
  },
  {
    id: "children",
    heading: "Children",
    blocks: [
      {
        type: "p",
        text: "The site is intended for people old enough to work and is not directed at children. We do not knowingly collect data from anyone under 16. If you believe a child has given us personal data, contact us and we will delete it.",
      },
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy as the service changes. The date at the top always reflects the current version. If a change materially affects how we use your data, we will tell you by email or by a notice on the site before it takes effect.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`How ${SITE_NAME} collects, uses and protects your personal data, and the rights you have over it.`}
      sections={SECTIONS}
      current="/privacy"
    />
  );
}
