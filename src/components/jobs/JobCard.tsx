"use client";

import Link from "next/link";
import { useState } from "react";
import { formatSalary, remoteLabel, timeAgo } from "@/lib/utils";

/* Map display name → Simple Icons slug (cdn.simpleicons.org/{slug}) */
const SKILL_ICONS: Record<string, string> = {
  "React":          "react",
  "React Native":   "react",
  "TypeScript":     "typescript",
  "JavaScript":     "javascript",
  "Next.js":        "nextdotjs",
  "Node.js":        "nodedotjs",
  "Python":         "python",
  "PostgreSQL":     "postgresql",
  "Docker":         "docker",
  "Kubernetes":     "kubernetes",
  "AWS":            "amazonaws",
  "Azure":          "microsoftazure",
  "GCP":            "googlecloud",
  "MongoDB":        "mongodb",
  "Redis":          "redis",
  "GraphQL":        "graphql",
  "Go":             "go",
  "Rust":           "rust",
  "Terraform":      "terraform",
  "Figma":          "figma",
  "Flutter":        "flutter",
  "Kotlin":         "kotlin",
  "Swift":          "swift",
  "Angular":        "angular",
  "Svelte":         "svelte",
  "MySQL":          "mysql",
  "Elasticsearch":  "elasticsearch",
  "Kafka":          "apachekafka",
  "Spark":          "apachespark",
  "Airflow":        "apacheairflow",
  "Snowflake":      "snowflake",
  "BigQuery":       "googlebigquery",
  "Ansible":        "ansible",
  "Java":           "java",
  "C++":            "cplusplus",
  "Android":        "android",
  "RabbitMQ":       "rabbitmq",
  "OWASP":          "owasp",
};

function SkillTag({ name }: { name: string }) {
  const [iconFailed, setIconFailed] = useState(false);
  const slug = SKILL_ICONS[name];

  return (
    <span className="tag tag-skill">
      {slug && !iconFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt=""
          className="skill-tag-icon"
          onError={() => setIconFailed(true)}
        />
      )}
      {name}
    </span>
  );
}

function CompanyLogo({ name, logoUrl, website }: { name: string; logoUrl?: string | null; website?: string | null }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  const domain = website
    ? website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]
    : null;
  const src = logoUrl
    ? logoUrl
    : domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=256`
      : null;

  if (src && !imgFailed) {
    return (
      <div className="job-card-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="job-card-logo-img" onError={() => setImgFailed(true)} />
      </div>
    );
  }

  return <div className="job-card-logo job-card-logo-fallback">{initial}</div>;
}

type JobCardProps = {
  id: string;
  slug: string;
  title: string;
  company: { name: string; logoUrl?: string | null; slug: string; website?: string | null };
  city?: string | null;
  remoteType: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  featured?: boolean;
  postedAt?: Date | string | null;
  tags?: { name: string }[];
};

export function JobCard({
  slug,
  title,
  company,
  city,
  remoteType,
  employmentType,
  experienceLevel,
  salaryMin,
  salaryMax,
  salaryCurrency = "EUR",
  featured,
  postedAt,
  tags = [],
}: JobCardProps) {
  const salary = formatSalary(salaryMin, salaryMax, salaryCurrency);
  const empLabel = employmentType.replace("_", "-").replace(/\b\w/g, (c) => c.toUpperCase());
  const expLabel = experienceLevel.charAt(0) + experienceLevel.slice(1).toLowerCase();

  return (
    <Link href={`/jobs/${slug}`} className="job-card">
      {featured && <span className="job-card-featured">FEATURED</span>}

      {/* Header: logo + company + time */}
      <div className="job-card-head">
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} website={company.website} />
        <div className="job-card-head-info">
          <span className="job-card-company">{company.name}</span>
          {postedAt && <span className="job-card-time">{timeAgo(postedAt)}</span>}
        </div>
      </div>

      {/* Title */}
      <h3 className="job-card-title">{title}</h3>

      {/* Meta: location, work type, employment, level */}
      <div className="job-card-meta">
        {city && <span className="tag">{city}</span>}
        <span className="tag tag-outline">{remoteLabel(remoteType)}</span>
        <span className="tag tag-outline">{empLabel}</span>
        <span className="tag tag-outline">{expLabel}</span>
      </div>

      {/* Skills — separate row with tech logos */}
      {tags.length > 0 && (
        <div className="job-card-skills">
          {tags.slice(0, 5).map((t) => (
            <SkillTag key={t.name} name={t.name} />
          ))}
        </div>
      )}

      {/* Footer: salary + apply */}
      <div className="job-card-footer">
        {salary && (
          <div className="job-card-salary">
            <strong>{salary}</strong>
            <span className="job-card-salary-period"> / yr</span>
          </div>
        )}
        <button className="btn btn-accent job-card-apply">Apply for this role →</button>
      </div>
    </Link>
  );
}
