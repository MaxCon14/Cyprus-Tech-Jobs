import Link from "next/link";
import { BadgeCheck, MapPin, Users } from "lucide-react";
import { CompanyLogoImg } from "@/components/jobs/CompanyLogoImg";

export type CompanyCardProps = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  city?: string | null;
  size?: string | null;
  techStack?: string[];
  verified?: boolean;
  featured?: boolean;
  openRoles: number;
};

export function CompanyCard({
  name, slug, logoUrl, description, city, size, techStack = [], verified, featured, openRoles,
}: CompanyCardProps) {
  return (
    <Link href={`/companies/${slug}`} className="company-card">
      {featured && <span className="company-card-featured">FEATURED</span>}

      <div className="company-card-head">
        <div className="job-card-logo">
          {logoUrl
            ? <CompanyLogoImg src={logoUrl} name={name} initial={name.charAt(0).toUpperCase()} />
            : <span className="job-card-logo-fallback">{name.charAt(0).toUpperCase()}</span>}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="company-card-name">{name}</span>
            {verified && <BadgeCheck size={15} style={{ color: "var(--accent)", flexShrink: 0 }} aria-label="Verified employer" />}
          </div>
          <div className="company-card-meta">
            {city && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{city}</span>}
            {size && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Users size={11} />{size}</span>}
          </div>
        </div>
      </div>

      {description && <p className="company-card-desc">{description}</p>}

      {techStack.length > 0 && (
        <div className="company-card-stack">
          {techStack.slice(0, 4).map(t => (
            <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
          ))}
          {techStack.length > 4 && (
            <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 10, alignSelf: "center" }}>
              {`+${techStack.length - 4}`}
            </span>
          )}
        </div>
      )}

      <div className="company-card-foot">
        {openRoles > 0
          ? <span className="tag tag-accent" style={{ fontSize: 11 }}>{openRoles === 1 ? "1 open role" : `${openRoles} open roles`}</span>
          : <span className="mono-s" style={{ color: "var(--text-subtle)" }}>NO OPEN ROLES</span>}
      </div>
    </Link>
  );
}
