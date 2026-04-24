import Link from "next/link";
import { formatSalary, remoteLabel, timeAgo } from "@/lib/utils";

type JobCardProps = {
  id: string;
  slug: string;
  title: string;
  company: { name: string; logoUrl?: string | null; slug: string };
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
  const initial = company.name.charAt(0).toUpperCase();
  const empLabel = employmentType.replace("_", "-").replace(/\b\w/g, (c) => c.toUpperCase());
  const expLabel = experienceLevel.charAt(0) + experienceLevel.slice(1).toLowerCase();

  return (
    <Link href={`/jobs/${slug}`} className="job-card">
      {featured && <span className="job-card-featured">FEATURED</span>}

      {/* Logo */}
      <div className="job-card-logo">
        {company.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logoUrl}
            alt={company.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 6 }}
          />
        ) : (
          initial
        )}
      </div>

      {/* Body */}
      <div className="job-card-body">
        <div className="job-card-top">
          <span className="job-card-company">{company.name}</span>
          {postedAt && (
            <span className="job-card-time">· {timeAgo(postedAt)}</span>
          )}
        </div>
        <h3 className="job-card-title">{title}</h3>
        <div className="job-card-meta">
          {city && <span className="tag">{city}</span>}
          <span className="tag tag-outline">{remoteLabel(remoteType)}</span>
          <span className="tag tag-outline">{empLabel}</span>
          <span className="tag tag-outline">{expLabel}</span>
          {tags.slice(0, 3).map((t) => (
            <span key={t.name} className="tag tag-outline">{t.name}</span>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="job-card-right">
        {salary && (
          <div className="job-card-salary">
            <strong>{salary}</strong>
          </div>
        )}
        <button className="btn btn-accent btn-sm">Apply →</button>
      </div>
    </Link>
  );
}
