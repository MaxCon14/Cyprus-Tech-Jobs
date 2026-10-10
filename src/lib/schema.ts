import { sanitizeJobHtml } from "./sanitize";

const BASE_URL = "https://cyprustech.careers";

const EMPLOYMENT_TYPE: Record<string, string> = {
  FULL_TIME:  "FULL_TIME",
  PART_TIME:  "PART_TIME",
  CONTRACT:   "CONTRACTOR",
  INTERNSHIP: "INTERN",
  FREELANCE:  "CONTRACTOR",
};

/* A job's city → its Cyprus administrative district. Google recommends
   `addressRegion` on a JobPosting's PostalAddress (the Rich Results Test warns
   when it's absent); the district is the correct region value for Cyprus. Only
   the towns we actually list are mapped — an unknown city just omits the region
   rather than guessing. */
const CITY_TO_REGION: Record<string, string> = {
  "Limassol":  "Limassol",
  "Nicosia":   "Nicosia",
  "Larnaca":   "Larnaca",
  "Paphos":    "Paphos",
  "Famagusta": "Famagusta",
  "Ayia Napa": "Famagusta",
  "Paralimni": "Famagusta",
  "Kyrenia":   "Kyrenia",
};

interface JobSchemaInput {
  id: string;
  slug: string;
  title: string;
  description: string;
  city: string | null;
  remoteType: string;
  employmentType: string;
  salaryDisclosed: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  postedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  company: {
    name: string;
    website: string | null;
    logoUrl?: string | null;
  } | null;
  curatedCompanyName?: string | null;
  curatedCompanyLogoUrl?: string | null;
  applyUrl?: string | null;
  /** Include only geographic eligibility explicitly confirmed by the employer. */
  applicantCountries?: string[];
}

// A recruiting platform's origin is not the employer's identity.
function organizationSameAs(job: JobSchemaInput): string | undefined {
  const site = job.company?.website?.trim();
  if (!site) return undefined;
  try {
    const url = new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

export function buildJobPostingSchema(job: JobSchemaInput) {
  const isRemote  = job.remoteType === "REMOTE";
  const applicantCountries = job.applicantCountries?.filter(country => country.trim()) ?? [];
  // The current listing model does not record remote eligibility. Keep these
  // pages searchable, but do not invent a country to obtain Google Jobs eligibility.
  if (isRemote && applicantCountries.length === 0) return null;
  const description = job.description.trimStart().startsWith("<")
    ? sanitizeJobHtml(job.description)
    : `<p>${job.description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": description,
    "url": `${BASE_URL}/jobs/${job.slug}`,
    "directApply": false,
    "identifier": {
      "@type": "PropertyValue",
      "name": "CyprusTechCareers",
      "value": job.id,
    },
    "datePosted": (job.postedAt ?? job.createdAt).toISOString(),
    "employmentType": EMPLOYMENT_TYPE[job.employmentType] ?? "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company?.name ?? job.curatedCompanyName ?? "",
      ...(organizationSameAs(job) && { "sameAs": organizationSameAs(job) }),
      // Curated listings carry their own logo instead of a Company record.
      ...((job.company?.logoUrl ?? job.curatedCompanyLogoUrl) && {
        "logo": job.company?.logoUrl ?? job.curatedCompanyLogoUrl,
      }),
    },
    ...(!isRemote && { "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.city ?? "Cyprus",
        ...(job.city && CITY_TO_REGION[job.city] && { "addressRegion": CITY_TO_REGION[job.city] }),
        "addressCountry": "CY",
      },
    } }),
    // TELECOMMUTE is for fully remote roles only. Hybrid roles keep their
    // physical jobLocation and no jobLocationType — marking them TELECOMMUTE
    // surfaces them in searches for remote work they don't qualify for.
    ...(isRemote && {
      "jobLocationType": "TELECOMMUTE",
      "applicantLocationRequirements": applicantCountries.map(name => ({ "@type": "Country", name })),
    }),
  };

  if (job.expiresAt) {
    schema["validThrough"] = job.expiresAt.toISOString();
  }

  if (job.salaryDisclosed && (job.salaryMin || job.salaryMax)) {
    schema["baseSalary"] = {
      "@type": "MonetaryAmount",
      "currency": job.salaryCurrency || "EUR",
      "value": {
        "@type": "QuantitativeValue",
        ...(job.salaryMin && { "minValue": job.salaryMin }),
        ...(job.salaryMax && { "maxValue": job.salaryMax }),
        "unitText": "YEAR",
      },
    };
  }

  return schema;
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `${BASE_URL}${item.path}`,
    })),
  };
}

export function buildOrganizationSchema(company: {
  name: string;
  website: string | null;
  description: string | null;
  city: string | null;
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Organization",
    "name": company.name,
    ...(company.website && {
      "url": company.website.startsWith("http")
        ? company.website
        : `https://${company.website}`,
    }),
    ...(company.description && { "description": company.description }),
    ...(company.city && {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": company.city,
        "addressCountry": "CY",
      },
    }),
  };
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  };
}

export function buildArticleSchema(post: {
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string | Date;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": { "@type": "Organization", "name": post.author, "url": BASE_URL },
    "publisher": { "@type": "Organization", "name": "CyprusTech.Careers", "url": BASE_URL },
    "datePublished": new Date(post.publishedAt).toISOString(),
    "url": `${BASE_URL}/blog/${post.slug}`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/blog/${post.slug}` },
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    "url": BASE_URL,
    "name": "CyprusTech.Careers",
    "description": "Curated technology and IT jobs in Cyprus",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/jobs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Serialise a schema object for embedding in a <script type="application/ld+json"> tag.
 *
 * JSON.stringify escapes quotes and backslashes but leaves `<` and `>` alone,
 * so any user-supplied string reaching a schema — a job title, a company name —
 * could contain `</script>` and close the block early. Everything after it was
 * then parsed as ordinary HTML, which made a job title like
 * `Dev</script><img src=x onerror=…>` execute on the listing page.
 *
 * Escaping these three characters as \uXXXX keeps the JSON semantically
 * identical (a JSON parser resolves the escapes) while making it impossible to
 * terminate the surrounding tag. U+2028/U+2029 are escaped too: they are legal
 * in JSON strings but are line terminators in older JS parsers.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
