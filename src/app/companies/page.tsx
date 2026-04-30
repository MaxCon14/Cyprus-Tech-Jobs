export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCompanies } from "@/lib/queries";
import { Search, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies Hiring in Cyprus",
  description: "Browse tech companies hiring in Cyprus. See open roles, company profiles, and culture.",
};

export default async function CompaniesPage() {
  const companies  = await getCompanies();
  const featured   = companies.filter(c => c.featured);

  return (
    <div className="page-container" style={{ paddingBlock: "clamp(24px, 4vw, 40px)" }}>

      <div style={{ marginBottom: 40 }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
          {companies.length} COMPANIES · CYPRUS TECH
        </div>
        <h1 className="display-m" style={{ marginBottom: 8 }}>Companies hiring in Cyprus</h1>
        <p className="body" style={{ color: "var(--text-muted)", maxWidth: 560 }}>
          From global fintech giants to local scale-ups — these are the tech companies building in Cyprus right now.
        </p>
      </div>

      <div style={{ position: "relative", maxWidth: 480, marginBottom: 48 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
        <input className="input" type="text" placeholder="Search companies…" style={{ paddingLeft: 36 }} />
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 className="h2">Featured companies</h2>
              <p className="body-s" style={{ color: "var(--text-muted)", marginTop: 4 }}>Actively hiring this week</p>
            </div>
            <span className="tag tag-pulse tag-success">Live now</span>
          </div>
          <div className="grid-3">
            {featured.map(co => (
              <CompanyCard key={co.slug} company={co} large />
            ))}
          </div>
        </div>
      )}

      {/* All */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
          <h2 className="h2">All companies</h2>
          <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{companies.length} TOTAL</span>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          {companies.map(co => <CompanyCard key={co.slug} company={co} />)}
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 64, padding: 40, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <h2 className="h2" style={{ marginBottom: 6 }}>Is your company hiring?</h2>
          <p className="body" style={{ color: "var(--text-muted)" }}>Get your roles in front of Cyprus&apos;s top tech talent. Listings go live in minutes.</p>
        </div>
        <Link href="/post-a-job" className="btn btn-accent btn-lg">Post a job →</Link>
      </div>
    </div>
  );
}

type Company = Awaited<ReturnType<typeof getCompanies>>[0];

function CompanyCard({ company: co, large = false }: { company: Company; large?: boolean }) {
  const openRoles = co._count.jobs;
  return (
    <Link
      href={`/companies/${co.slug}`}
      style={{ display: "block", textDecoration: "none", border: "1px solid var(--border)", borderRadius: 10, padding: large ? 24 : 20, background: "var(--surface)", transition: "all 200ms cubic-bezier(0.16,1,0.3,1)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: large ? 16 : 12 }}>
        <div style={{ width: large ? 52 : 44, height: large ? 52 : 44, borderRadius: 8, background: "var(--black)", color: "var(--white)", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: large ? 18 : 15, flexShrink: 0 }}>
          {co.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: large ? 16 : 14, color: "var(--text)" }}>{co.name}</span>
            {co.verified && <span className="tag tag-success" style={{ fontSize: 10, padding: "2px 6px" }}>✓</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{co.city}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-strong)", display: "inline-block" }} />
            <span className="mono-s" style={{ color: "var(--accent)" }}>{openRoles} open roles</span>
          </div>
        </div>
      </div>

      {large && co.description && (
        <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {co.description}
        </p>
      )}

      {co.website && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <ExternalLink size={10} style={{ color: "var(--text-subtle)" }} />
          <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{co.website}</span>
        </div>
      )}
    </Link>
  );
}
