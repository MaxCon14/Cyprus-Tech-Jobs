// Server component: the card is static markup rendered many times per page,
// so it stays on the server. Only the two genuinely interactive bits are
// client islands — SaveJobButton (reads saved state from context itself) and
// the image fallbacks (CompanyLogoImg / SkillIcon).

import Link from "next/link";
import { formatSalary, remoteLabel, timeAgo } from "@/lib/utils";
import { SaveJobButton } from "./SaveJobButton";
import { SkillTag } from "./SkillTag";
import { CompanyLogoImg } from "./CompanyLogoImg";

/* No favicon fallback. This used to fetch https://www.google.com/s2/favicons
   when a company had no logo, which put a request to Google on every page a
   candidate browses — handing over their IP and the page they were reading,
   for a 16px image. Companies and curated listings can both upload a logo now,
   and the initial tile is a fine stand-in when they haven't. */
function CompanyLogo({ name, logoUrl }: { name: string; logoUrl?: string | null; website?: string | null }) {
  const initial = name.charAt(0).toUpperCase();

  if (logoUrl) return <CompanyLogoImg src={logoUrl} name={name} initial={initial} />;

  return <div className="job-card-logo job-card-logo-fallback">{initial}</div>;
}

function CuratedLogo() {
  return (
    <div className="job-card-logo" style={{ display: "grid", placeItems: "center", background: "var(--bg-muted)", borderRadius: 10 }}>
      <svg width="28" height="26" viewBox="0 0 628 576" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M234.178 81.8274C258.724 80.0262 283.352 84.0763 306.031 93.6387C354.289 114.076 376.911 148.774 395.717 194.74C427.171 196.938 456.134 207.959 481.685 229.363C548.67 285.475 573.597 455.969 516.642 524.313C481.668 566.276 378.055 570.73 322.872 574.333C240.4 577.345 67.8426 585.082 19.4964 502.064C-5.19045 459.673 -3.93004 390.244 9.41989 343.66C21.3852 301.91 39.1243 279.682 76.4278 258.847C92.2975 168.801 137.32 95.4874 234.178 81.8274Z" fill="currentColor" style={{ color: "var(--text-subtle)" }}/>
        <path d="M286.845 278.152C256.611 278.152 247.806 312.32 247.805 354.471C247.805 396.623 256.611 430.796 286.845 430.796C317.079 430.794 325.881 396.622 325.881 354.471C325.88 312.321 317.079 278.154 286.845 278.152Z" fill="var(--bg)"/>
        <path d="M422.629 278.152C392.394 278.152 383.59 312.32 383.589 354.471C383.589 396.623 392.394 430.796 422.629 430.796C452.863 430.794 461.665 396.622 461.665 354.471C461.664 312.321 452.863 278.154 422.629 278.152Z" fill="var(--bg)"/>
        <path d="M544.097 4.72659C546.156 -1.57553 555.154 -1.57553 557.213 4.72659L573.818 55.5565C574.491 57.6168 576.11 59.2388 578.182 59.928L623.301 74.9354C629.566 77.0196 629.566 85.8011 623.301 87.8852L578.182 102.893C576.11 103.582 574.491 105.204 573.818 107.264L557.213 158.094C555.154 164.396 546.156 164.396 544.097 158.094L527.475 107.213C526.811 105.182 525.227 103.574 523.192 102.87L479.861 87.8576C473.704 85.7244 473.704 77.0962 479.861 74.9631L523.192 59.9511C525.227 59.2462 526.811 57.639 527.475 55.6072L544.097 4.72659Z" fill="#FD3F73"/>
      </svg>
    </div>
  );
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
  isCurated?: boolean;
  curatedCompanyName?: string | null;
  curatedCompanyLogoUrl?: string | null;
  postedAt?: Date | string | null;
  tags?: { name: string }[];
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
  isCurated = false,
  curatedCompanyName,
  curatedCompanyLogoUrl,
  postedAt,
  tags = [],
}: JobCardProps) {
  const salary = salaryDisclosed ? formatSalary(salaryMin, salaryMax, salaryCurrency) : null;
  const empLabel = employmentType.replace("_", "-").replace(/\b\w/g, (c) => c.toUpperCase());
  const expLabel = experienceLevel.charAt(0) + experienceLevel.slice(1).toLowerCase();
  const displayName = isCurated && curatedCompanyName ? curatedCompanyName : company.name;

  return (
    <Link href={`/jobs/${slug}`} className="job-card">
      {featured && <span className="job-card-featured">FEATURED</span>}
      {isCurated && <span className="job-card-featured" style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent)" }}>CURATED</span>}

      {/* Header: logo + company + time + save */}
      <div className="job-card-head">
        {/* Curated listings have no Company row. Use the logo uploaded with the
            job when there is one, and the generic mark when there isn't. */}
        {isCurated
          ? (curatedCompanyLogoUrl
              ? <CompanyLogo name={displayName} logoUrl={curatedCompanyLogoUrl} />
              : <CuratedLogo />)
          : <CompanyLogo name={company.name} logoUrl={company.logoUrl} website={company.website} />}
        <div className="job-card-head-info">
          <span className="job-card-company">{displayName}</span>
          {postedAt && <span className="job-card-time">{timeAgo(postedAt)}</span>}
        </div>
        <SaveJobButton jobId={id} />
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
        <button className="btn btn-accent job-card-apply">Apply for this role</button>
      </div>
    </Link>
  );
}
