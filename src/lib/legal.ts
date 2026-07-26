/**
 * Shared facts for the legal pages (/terms, /privacy, /cookies).
 *
 * Keep these here rather than inline in each page: the operator's details and
 * the contact address appear in all three documents, and a privacy policy that
 * disagrees with itself about who the controller is, is worse than none.
 */

export const SITE_NAME = "CyprusTech.Careers";
export const SITE_URL  = "https://cyprustech.careers";

/** Address that receives data-protection and legal enquiries. Must be a mailbox
 *  that actually accepts inbound mail — GDPR requires a reachable controller. */
export const CONTACT_EMAIL = "help@cyprustech.careers";

/**
 * Registered company details. Left blank until the operating entity is
 * confirmed; every field is rendered only when non-empty, so the pages stay
 * publishable in the meantime and gain the detail the moment it is filled in.
 */
export const LEGAL_ENTITY = {
  /** e.g. "Example Ltd" — the company that operates the site */
  registeredName: "",
  /** e.g. "HE 123456" */
  registrationNumber: "",
  /** e.g. "1 Example Street, 1010 Nicosia, Cyprus" */
  registeredAddress: "",
} as const;

export const LAST_UPDATED = "26 July 2026";

/** Cyprus supervisory authority for GDPR complaints. */
export const DPA = {
  name: "Office of the Commissioner for Personal Data Protection",
  country: "Cyprus",
  url: "https://www.dataprotection.gov.cy",
} as const;

export function hasEntityDetails(): boolean {
  return Boolean(LEGAL_ENTITY.registeredName || LEGAL_ENTITY.registeredAddress);
}

/** "CyprusTech.Careers" or "Example Ltd (CyprusTech.Careers)" once known. */
export function operatorLabel(): string {
  return LEGAL_ENTITY.registeredName
    ? `${LEGAL_ENTITY.registeredName} (${SITE_NAME})`
    : SITE_NAME;
}
