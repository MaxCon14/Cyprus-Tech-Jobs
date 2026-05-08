export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { JobCard } from "@/components/jobs/JobCard";
import { ExternalLink, MapPin, Users, Calendar, ChevronLeft } from "lucide-react";
import { buildOrganizationSchema, buildBreadcrumbSchema } from "@/lib/schema";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const co = await getCompanyBySlug(slug);
  if (!co) return {};
  return {
    title: `${co.name} — Jobs in Cyprus`,
    description: `${co._count.jobs} open roles at ${co.name} in ${co.city}.`,
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  const co = await getCompanyBySlug(slug);
  if (!co) notFound();

  const jobs = co.jobs.map(j => serialiseJob({ ...j, company: co, tags: j.tags }));

  const orgSchema        = buildOrganizationSchema(co);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Companies", path: "/companies" },
    { name: co.name, path: `/companies/${co.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="page-container" style={{ paddingBlock: "clamp(24px, 4vw, 40px)" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <Link href="/companies" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>
            <ChevronLeft size={14} /> Companies
          </Link>
          <span style={{ color: "var(--border-strong)" }}>/</span>
          <span className="body-s" style={{ color: "var(--text-subtle)" }}>{co.name}</span>
        </div>

        {/* Header card */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "clamp(20px, 3vw, 32px)", marginBottom: 32, background: "var(--surface)" }}>
          <div className="company-header-inner">
            {/* Logo */}
            <div style={{ width: 64, height: 64, borderRadius: 12, background: "var(--black)", color: "var(--white)", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 24, flexShrink: 0, border: "1px solid var(--border)" }}>
              {co.name.charAt(0)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Name on its own line — no badges competing for space */}
              <h1 className="h1" style={{ marginBottom: 6, lineHeight: 1.1 }}>{co.name}</h1>

              {/* Badges row */}
              {(co.verified || co.featured) && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {co.verified && <span className="tag tag-success">✓ Verified</span>}
                  {co.featured && <span className="tag tag-accent">Featured</span>}
                </div>
              )}

              {/* Meta */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                {co.city && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }} className="body-s">
                    <MapPin size={13} style={{ color: "var(--text-subtle)" }} />
                    <span style={{ color: "var(--text-muted)" }}>{co.city}, Cyprus</span>
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 5 }} className="body-s">
                  <Users size={13} style={{ color: "var(--text-subtle)" }} />
                  <span style={{ color: "var(--text-muted)" }}>{co._count.jobs} open role{co._count.jobs !== 1 ? "s" : ""}</span>
                </span>
                {co.createdAt && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }} className="body-s">
                    <Calendar size={13} style={{ color: "var(--text-subtle)" }} />
                    <span style={{ color: "var(--text-muted)" }}>Since {new Date(co.createdAt).getFullYear()}</span>
                  </span>
                )}
              </div>

              {co.website && (
                <a href={`https://${co.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  <ExternalLink size={13} /> {co.website}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main content + sidebar — collapses to 1 col at 768px */}
        <div className="layout-sidebar-right">

          {/* Left: description + jobs */}
          <div>
            {co.description && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "clamp(20px, 3vw, 28px)", marginBottom: 24, background: "var(--surface)" }}>
                <h2 className="h2" style={{ marginBottom: 16 }}>About {co.name}</h2>
                <p className="body-l" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{co.description}</p>
              </div>
            )}

            <h2 className="h2" style={{ marginBottom: 16 }}>
              Open roles <span style={{ color: "var(--accent)" }}>({co._count.jobs})</span>
            </h2>

            {jobs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {jobs.map(j => <JobCard key={j.id} {...j} />)}
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "clamp(24px, 4vw, 40px)", textAlign: "center", background: "var(--surface)" }}>
                <p className="body" style={{ color: "var(--text-muted)" }}>No active listings right now.</p>
                {co.website && (
                  <a href={`https://${co.website}/careers`} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{ marginTop: 16 }}>
                    View careers at {co.name} →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16 }}>QUICK FACTS</div>
              {[
                ["Location",   (co.city ?? "Cyprus") + ", Cyprus"],
                ["Open roles", String(co._count.jobs)],
                ["Verified",   co.verified ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="body-s" style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="mono-s" style={{ color: "var(--text)" }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
              <h3 className="h3" style={{ marginBottom: 8 }}>Get alerts for {co.name}</h3>
              <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 14 }}>
                Be the first to know when {co.name} posts a new role.
              </p>
              <input className="input" type="email" placeholder="your@email.com" style={{ marginBottom: 10 }} />
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Notify me</button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
