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
  };
}

export function buildJobPostingSchema(job: JobSchemaInput) {
  const isRemote = job.remoteType === "REMOTE";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "CyprusTechJobs",
      "value": job.id,
    },
    "datePosted": (job.postedAt ?? job.createdAt).toISOString(),
    "employmentType": EMPLOYMENT_TYPE[job.employmentType] ?? "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company.name,
      ...(job.company.website && {
        "sameAs": job.company.website.startsWith("http")
          ? job.company.website
          : `https://${job.company.website}`,
      }),
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

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    "url": BASE_URL,
    "name": "CyprusTech.Jobs",
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
