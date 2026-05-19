const BASE_URL = "https://cyprustech.careers";

const EMPLOYMENT_TYPE: Record<string, string> = {
  FULL_TIME:  "FULL_TIME",
  PART_TIME:  "PART_TIME",
  CONTRACT:   "CONTRACTOR",
  INTERNSHIP: "INTERN",
  FREELANCE:  "CONTRACTOR",
};

interface JobSchemaInput {
  id: string;
  slug: string;
  title: string;
  description: string;
  city: string | null;
  remoteType: string;
  employmentType: string;
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
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
}

export function buildJobPostingSchema(job: JobSchemaInput) {
  const isRemote  = job.remoteType === "REMOTE";
  const isHybrid  = job.remoteType === "HYBRID";
  const plainDesc = job.description.trimStart().startsWith("<")
    ? stripHtml(job.description)
    : job.description;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": plainDesc,
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
      ...(job.company?.website && {
        "sameAs": job.company!.website!.startsWith("http")
          ? job.company!.website
          : `https://${job.company!.website}`,
      }),
      ...(job.company?.logoUrl && { "logo": job.company!.logoUrl }),
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.city ?? "Cyprus",
        "addressCountry": "CY",
      },
    },
    ...(isRemote && {
      "jobLocationType": "TELECOMMUTE",
      "applicantLocationRequirements": { "@type": "Country", "name": "Cyprus" },
    }),
    ...(isHybrid && {
      "jobLocationType": "TELECOMMUTE",
    }),
  };

  if (job.expiresAt) {
    schema["validThrough"] = job.expiresAt.toISOString();
  }

  if (job.salaryMin || job.salaryMax) {
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
    "description": "Tech jobs in Cyprus — curated listings with salaries",
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
