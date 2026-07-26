import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL, LEGAL_ENTITY, operatorLabel } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service — CyprusTech.Careers",
  description:
    "The terms governing use of CyprusTech.Careers by job seekers and employers, including accounts, listing slots, payment, refunds and acceptable use.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "Terms of Service — CyprusTech.Careers",
    description: "The terms governing use of CyprusTech.Careers by job seekers and employers.",
    url: `${SITE_URL}/terms`,
    type: "website",
  },
};

const introLine = [
  `These terms are an agreement between you and ${operatorLabel()}, which operates cyprustech.careers.`,
  LEGAL_ENTITY.registeredAddress ? `Registered address: ${LEGAL_ENTITY.registeredAddress}.` : "",
].filter(Boolean).join(" ");

const SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    heading: "The agreement",
    blocks: [
      { type: "p", text: introLine },
      {
        type: "p",
        text: "By using the site, creating an account or buying listing slots, you accept these terms. If you do not accept them, do not use the site. If you are agreeing on behalf of a company, you confirm you are authorised to bind it.",
      },
    ],
  },
  {
    id: "what-we-do",
    heading: "What the service is",
    blocks: [
      {
        type: "p",
        text: `${SITE_NAME} is a job board for technology roles in Cyprus. Employers publish listings; job seekers browse them and can apply, either through the site or by whatever route the employer specifies.`,
      },
      {
        type: "note",
        text: "We are a noticeboard, not an employment agency. We are not a party to any employment relationship, we do not vet employers or candidates beyond basic abuse prevention, and we do not guarantee that any listing is genuine, that any role is filled, or that any application is read.",
      },
    ],
  },
  {
    id: "accounts",
    heading: "Accounts",
    blocks: [
      {
        type: "ul",
        items: [
          "You must give accurate details and keep them current.",
          "One person or company per account. Do not share access or impersonate anyone.",
          "Sign-in uses a single-use code sent to your email. Keep access to that mailbox secure — anyone who can read it can sign in as you.",
          "An email address may be registered as either a job seeker or an employer, not both.",
          "You can delete your account at any time from your dashboard.",
        ],
      },
      {
        type: "p",
        text: "We may suspend or close an account that breaches these terms, is used for fraud or abuse, or puts other users at risk. Where it is reasonable to do so, we will tell you why.",
      },
    ],
  },
  {
    id: "job-seekers",
    heading: "If you are a job seeker",
    blocks: [
      {
        type: "ul",
        items: [
          "Using the site as a job seeker is free.",
          "Everything you put in your profile, CV and cover letters must be truthful and yours to share.",
          "When you apply, the employer receives your profile, CV and cover letter and handles them under its own privacy policy. We cannot retract that copy for you.",
          "Do not apply on behalf of someone else or submit another person's CV as your own.",
        ],
      },
    ],
  },
  {
    id: "employers",
    heading: "If you are an employer",
    blocks: [
      {
        type: "p",
        text: "Listings must describe a real, currently open role at the company named. In addition:",
      },
      {
        type: "ul",
        items: [
          "A salary range is mandatory on every published listing, and it must be the range you would genuinely pay for the role.",
          "Do not post multi-level marketing schemes, unpaid work advertised as employment, recruitment for a client you cannot name, or anything requiring the candidate to pay a fee.",
          "Listings must comply with Cyprus and EU employment and equal treatment law. Do not advertise requirements that discriminate on grounds such as sex, race, ethnic origin, religion or belief, disability, age or sexual orientation.",
          "Do not use applicant data for anything other than assessing the application. It is not a marketing list.",
          "You are the controller of applicant data you receive and are responsible for handling it lawfully.",
        ],
      },
      {
        type: "note",
        text: "A listing that advertises a salary range the employer has no intention of honouring may be removed. Where we remove a listing for that reason we will refund the slot it used.",
      },
    ],
  },
  {
    id: "slots-and-payment",
    heading: "Listing slots and payment",
    blocks: [
      {
        type: "ul",
        items: [
          "Publishing a job consumes one listing slot. Slots are bought in advance in Standard and Featured tiers.",
          "Slots do not expire. You can buy them now and use them whenever you are ready.",
          "A published listing stays active for 30 days, after which it expires automatically and leaves the public listings. Re-posting uses another slot.",
          "Featured listings are promoted above Standard listings in search results.",
          "Prices are shown at checkout and include any applicable VAT. Payment is processed by Stripe; we never receive your card details.",
        ],
      },
    ],
  },
  {
    id: "refunds",
    heading: "Refunds",
    blocks: [
      {
        type: "p",
        text: "Unused slots can be refunded within 14 days of purchase. Once a slot has been used to publish a listing, it is treated as consumed and is not refundable, except where we remove the listing for a reason that is our fault or under the salary range rule above.",
      },
      {
        type: "p",
        text: `To request a refund, email ${CONTACT_EMAIL} from the address on your employer account.`,
      },
    ],
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    blocks: [
      {
        type: "p",
        text: "Whichever kind of account you have, do not:",
      },
      {
        type: "ul",
        items: [
          "Scrape, bulk-download or systematically copy listings or profiles.",
          "Use the site to send spam or unsolicited marketing.",
          "Upload malware, or attempt to break, overload or gain unauthorised access to the service.",
          "Post content that is unlawful, defamatory, harassing, or infringes someone else's rights.",
          "Misrepresent who you are or who you work for.",
        ],
      },
    ],
  },
  {
    id: "content",
    heading: "Your content",
    blocks: [
      {
        type: "p",
        text: "You keep ownership of everything you upload — listings, profiles, CVs, logos and cover letters. You grant us a licence to host, store, reproduce and display that content for the purpose of operating the service, including showing listings to job seekers and profiles to employers you have applied to.",
      },
      {
        type: "p",
        text: "That licence ends when you delete the content or your account, except where we must retain something to meet a legal obligation, and except for copies an employer has already received.",
      },
      {
        type: "p",
        text: `The site itself — its design, code, branding and the ${SITE_NAME} name — belongs to us and may not be copied or reused without permission.`,
      },
    ],
  },
  {
    id: "availability",
    heading: "Availability",
    blocks: [
      {
        type: "p",
        text: "We aim to keep the site running but do not promise uninterrupted availability. We may change, suspend or discontinue features. If we discontinue something you have paid for and cannot provide an equivalent, we will refund the unused portion.",
      },
    ],
  },
  {
    id: "liability",
    heading: "Liability",
    blocks: [
      {
        type: "p",
        text: "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited — including your rights as a consumer under Cyprus and EU law, which these terms do not affect.",
      },
      {
        type: "p",
        text: "Subject to that, we are not liable for hiring decisions, for the conduct or accuracy of any employer or candidate, for loss of profits or opportunity, or for indirect or consequential loss. Our total liability to an employer in connection with the service is limited to the amount that employer paid us in the twelve months before the claim.",
      },
    ],
  },
  {
    id: "law",
    heading: "Governing law and disputes",
    blocks: [
      {
        type: "p",
        text: "These terms are governed by the law of the Republic of Cyprus, and the courts of Cyprus have jurisdiction. If you are a consumer, this does not deprive you of the protection of the mandatory law of the country where you live, or of the right to bring proceedings there.",
      },
      {
        type: "p",
        text: "If any provision is found unenforceable, the rest stays in force.",
      },
    ],
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    blocks: [
      {
        type: "p",
        text: "We may update these terms as the service develops. The date at the top reflects the current version. If a change materially affects your rights we will give notice by email or on the site before it takes effect. Continuing to use the service after that means you accept the new terms.",
      },
      { type: "p", text: `Questions about these terms: ${CONTACT_EMAIL}.` },
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      intro={`The rules for using ${SITE_NAME}, for both job seekers and employers.`}
      sections={SECTIONS}
      current="/terms"
    />
  );
}
