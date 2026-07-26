export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, MapPin, Users, Globe, ArrowLeft } from "lucide-react";
import { getCompanyBySlug } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { JobCard } from "@/components/jobs/JobCard";
import { CompanyLogoImg } from "@/components/jobs/CompanyLogoImg";
import { buildOrganizationSchema, buildBreadcrumbSchema } from "@/lib/schema";

const BASE = "https://cyprustech.careers";

function absoluteUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** "https://www.acme.com/careers" → "acme.com" */
function prettyHost(url: string): string {
  try {
    return new URL(absoluteUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;

  let company: Awaited<ReturnType<typeof getCompanyBySlug>> = null;
  try {
    company = await getCompanyBySlug(slug);
  } catch {
    company = null;
  }
  if (!company) return { title: "Company not found — CyprusTech.Careers" };

  const open = company._count.jobs;
  const title = `${company.name} — Jobs & Company Profile | CyprusTech.Careers`;
  const description =
    company.description?.slice(0, 155) ??
    `${company.name} is hiring in Cyprus. See their ${open > 0 ? `${open} open ${open === 1 ? "role" : "roles"}, ` : ""}tech stack and company profile.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/companies/${company.slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE}/companies/${company.slug}`,
      type: "profile",
      ...(company.logoUrl && { images: [{ url: company.logoUrl }] }),
    },
    /* A profile with nothing live is thin content — keep it reachable for
       anyone following a link, but out of the index until it has a role. */
    ...(open === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function CompanyProfilePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let company: Awaited<ReturnType<typeof getCompanyBySlug>> = null;
  try {
    company = await getCompanyBySlug(slug);
  } catch {
    company = null;
  }
  if (!company) notFound();

  /* The nested jobs come back without a `company` relation — they are already
     under it — but JobCard needs one to render the logo and name, so graft the
     parent on before serialising. */
  const parent = {
    name:    company.name,
    slug:    company.slug,
    logoUrl: company.logoUrl,
    website: company.website,
  };
  const jobs = company.jobs.map(j => serialiseJob({ ...j, company: parent }));
  const initial = company.name.charAt(0).toUpperCase();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema({
          name:        company.name,
          website:     company.website,
          description: company.description,
          city:        company.city,
        })) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema([
          { name: "Home",      path: "/" },
          { name: "Companies", path: "/companies" },
          { name: company.name, path: `/companies/${company.slug}` },
        ])) }}
      />

      {/* ── Header ── */}
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "clamp(28px, 5vw, 48px) 0" }}>
        <div className="page-container">
          <Link
            href="/companies"
            className="body-s"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", textDecoration: "none", marginBottom: 20 }}
          >
            <ArrowLeft size={14} /> All companies
          </Link>

          <div className="company-header-inner">
            <div className="job-card-logo" style={{ width: 72, height: 72, borderRadius: 14 }}>
              {company.logoUrl
                ? <CompanyLogoImg src={company.logoUrl} name={company.name} initial={initial} />
                : <span className="job-card-logo-fallback" style={{ fontSize: 26 }}>{initial}</span>}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <h1 className="h1" style={{ margin: 0 }}>{company.name}</h1>
                {company.verified && (
                  <span className="tag tag-accent" style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <BadgeCheck size={13} /> Verified
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                {company.city && (
                  <span className="body-s" style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={13} /> {company.city}
                  </span>
                )}
                {company.size && (
                  <span className="body-s" style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Users size={13} /> {company.size}
                  </span>
                )}
                {company.website && (
                  <a
                    href={absoluteUrl(company.website)}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="body-s"
                    style={{ color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                  >
                    <Globe size={13} /> {prettyHost(company.website)}
                  </a>
                )}
                <span className="mono-s" style={{ color: "var(--text-subtle)" }}>
                  {company._count.jobs === 0 ? "NO OPEN ROLES" : `${company._count.jobs} OPEN ${company._count.jobs === 1 ? "ROLE" : "ROLES"}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section style={{ padding: "clamp(32px, 5vw, 56px) 0 clamp(48px, 7vw, 80px)", background: "var(--bg-alt)", minHeight: "60vh" }}>
        <div className="page-container">
          <div className="layout-sidebar-right">

            <div style={{ minWidth: 0 }}>
              <h2 className="h2" style={{ marginBottom: 18 }}>
                {company._count.jobs === 0 ? "Open roles" : `Open roles at ${company.name}`}
              </h2>

              {jobs.length === 0 ? (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "36px 24px", textAlign: "center" }}>
                  <p className="body" style={{ color: "var(--text-muted)", marginBottom: 6 }}>
                    {`${company.name} has no live openings right now.`}
                  </p>
                  <p className="body-s" style={{ color: "var(--text-subtle)", marginBottom: 18 }}>
                    New roles show up here as soon as they are published.
                  </p>
                  <Link href="/jobs" className="btn btn-outline">Browse all jobs</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {jobs.map(job => <JobCard key={job.id} {...job} />)}
                </div>
              )}
            </div>

            <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 90 }}>
              {company.description && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                  <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>About</p>
                  <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {company.description}
                  </p>
                </div>
              )}

              {company.techStack.length > 0 && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                  <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Tech stack</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {company.techStack.map(t => (
                      <span key={t} className="tag" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {company.website && (
                <a
                  href={absoluteUrl(company.website)}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn btn-outline"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Globe size={14} /> Visit website
                </a>
              )}
            </aside>

          </div>
        </div>
      </section>
    </>
  );
}
