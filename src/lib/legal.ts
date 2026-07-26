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
 * Who operates the site, and is therefore the data controller.
 *
 * GDPR asks for an identifiable controller, not an incorporated one — a natural
 * person running a site is as valid a controller as a limited company, and
 * "CyprusTech.Careers" alone is not an answer because a trading name is not a
 * legal person. So this models both cases: set `type` to "individual" and put
 * your own full name in `legalName` until (or unless) a company exists.
 *
 * Every field renders only when non-empty, so the pages stay publishable while
 * this is being sorted out and gain the detail the moment it is filled in.
 */
export const LEGAL_ENTITY = {
  /** "individual" for a sole operator; "company" once one is incorporated. */
  type: "individual" as "individual" | "company",
  /** Your full legal name, or the company's registered name. */
  registeredName: "",
  /** Companies only, e.g. "HE 123456". Leave blank for an individual. */
  registrationNumber: "",
  /** A postal address that can receive legal and data-protection mail. It does
   *  not have to be a home address — a service or accountant's address is
   *  fine, and is the usual choice for someone operating on their own. */
  registeredAddress: "",
};

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

/**
 * How the operator is named in prose.
 *
 * "CyprusTech.Careers" while unset, then "Example Ltd (CyprusTech.Careers)" for
 * a company, or "Jane Smith, trading as CyprusTech.Careers" for an individual —
 * the wording that makes a person, rather than a website, the counterparty.
 */
export function operatorLabel(): string {
  if (!LEGAL_ENTITY.registeredName) return SITE_NAME;
  return LEGAL_ENTITY.type === "individual"
    ? `${LEGAL_ENTITY.registeredName}, trading as ${SITE_NAME}`
    : `${LEGAL_ENTITY.registeredName} (${SITE_NAME})`;
}

/** Registration line for the privacy policy — companies only; an individual has
 *  no company number, and inventing a line for one would be worse than silence. */
export function registrationLine(): string {
  return LEGAL_ENTITY.type === "company" && LEGAL_ENTITY.registeredName && LEGAL_ENTITY.registrationNumber
    ? `Registered in Cyprus under company number ${LEGAL_ENTITY.registrationNumber}.`
    : "";
}

/** Postal address line. "Registered address" is company language; an individual
 *  gives a contact address. */
export function addressLine(): string {
  if (!LEGAL_ENTITY.registeredAddress) return "";
  const label = LEGAL_ENTITY.type === "individual" ? "Contact address" : "Registered address";
  return `${label}: ${LEGAL_ENTITY.registeredAddress}.`;
}
