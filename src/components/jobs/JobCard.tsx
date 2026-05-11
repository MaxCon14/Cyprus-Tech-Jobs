"use client";

import Link from "next/link";
import { useState } from "react";
import { formatSalary, remoteLabel, timeAgo } from "@/lib/utils";
import { SaveJobButton } from "./SaveJobButton";
import { SkillTag } from "./SkillTag";

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
  salaryDisclosed?: boolean;
  featured?: boolean;
  postedAt?: Date | string | null;
  tags?: { name: string }[];
  savedJobIds?: string[];
};

export function JobCard({
  id,
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
  salaryDisclosed = true,
  featured,
  postedAt,
  tags = [],
  savedJobIds,
}: JobCardProps) {
  const salary = salaryDisclosed ? formatSalary(salaryMin, salaryMax, salaryCurrency) : null;
  const empLabel = employmentType.replace("_", "-").replace(/\b\w/g, (c) => c.toUpperCase());
  const expLabel = experienceLevel.charAt(0) + experienceLevel.slice(1).toLowerCase();

  return (
    <Link href={`/jobs/${slug}`} className="job-card">
      {featured && <span className="job-card-featured">FEATURED</span>}

      {/* Header: logo + company + time + save */}
      <div className="job-card-head">
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} website={company.website} />
        <div className="job-card-head-info">
          <span className="job-card-company">{company.name}</span>
          {postedAt && <span className="job-card-time">{timeAgo(postedAt)}</span>}
        </div>
        <SaveJobButton
          jobId={id}
          initialSaved={savedJobIds?.includes(id) ?? false}
          isCandidate={savedJobIds !== undefined}
        />
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
        {salary ? (
          <div className="job-card-salary">
            <strong>{salary}</strong>
            <span className="job-card-salary-period"> / yr</span>
          </div>
        ) : !salaryDisclosed ? (
          <div className="job-card-salary" style={{ color: "var(--text-subtle)" }}>
            <strong>Undisclosed</strong>
          </div>
        ) : null}
        <button className="btn btn-accent job-card-apply">Apply for this role →</button>
      </div>
    </Link>
  );
}
