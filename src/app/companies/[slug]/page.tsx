export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { JobCard } from "@/components/jobs/JobCard";
import { ExternalLink, MapPin, Users, Calendar, ChevronLeft } from "lucide-react";
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

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <Link href="/companies" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>
          <ChevronLeft size={14} /> Companies
        </Link>
        <span style={{ color: "var(--border-strong)" }}>/</span>
        <span className="body-s" style={{ color: "var(--text-subtle)" }}>{co.name}</span>
      </div>

      {/* Header */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 32, marginBottom: 32, background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: 14, flexShrink: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
            {co.logoUrl
              ? <img src={co.logoUrl} alt={co.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: "var(--black)", color: "var(--white)", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 28 }}>{co.name.charAt(0)}</div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <h1 className="display-m">{co.name}</h1>
              {co.verified && <span className="tag tag-success">✓ Verified</span>}
              {co.featured && <span className="tag tag-accent">Featured</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              {co.city && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }} className="body-s">
                  <MapPin size={13} style={{ color: "var(--text-subtle)" }} />
                  <span style={{ color: "var(--text-muted)" }}>{co.city}, Cyprus</span>
                </span>
              )}
              {co.createdAt && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }} className="body-s">
                  <Calendar size={13} style={{ color: "var(--text-subtle)" }} />
                  <span style={{ color: "var(--text-muted)" }}>On CyprusTech.Careers since {new Date(co.createdAt).getFullYear()}</span>
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 6 }} className="body-s">
                <Users size={13} style={{ color: "var(--text-subtle)" }} />
                <span style={{ color: "var(--text-muted)" }}>{co._count.jobs} open role{co._count.jobs !== 1 ? "s" : ""}</span>
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            {co.website && (
              <a href={`https://${co.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <ExternalLink size={14} /> {co.website}
              </a>
            )}
            <div className="mono-s" style={{ color: "var(--accent)" }}>{co._count.jobs} open roles</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}>

        {/* Left */}
        <div>
          {co.description && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 28, marginBottom: 24, background: "var(--surface)" }}>
              <h2 className="h2" style={{ marginBottom: 16 }}>About {co.name}</h2>
              <p className="body-l" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{co.description}</p>
            </div>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 className="h2">Open roles <span style={{ color: "var(--accent)" }}>({co._count.jobs})</span></h2>
            </div>
            {jobs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {jobs.map(j => <JobCard key={j.id} {...j} />)}
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 40, textAlign: "center", background: "var(--surface)" }}>
                <p className="body" style={{ color: "var(--text-muted)" }}>No active listings right now.</p>
                {co.website && (
                  <a href={`https://${co.website}/careers`} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{ marginTop: 16 }}>
                    View careers at {co.name} →
                  </a>
                )}
              </div>
            )}
          </div>
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
  );
}
