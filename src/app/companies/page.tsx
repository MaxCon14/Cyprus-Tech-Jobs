import Link from "next/link";
import { COMPANIES } from "@/lib/placeholder-data";
import { Search, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies Hiring in Cyprus",
  description: "Browse tech companies hiring in Cyprus. See open roles, company profiles, and culture.",
};

export default function CompaniesPage() {
  const featured = COMPANIES.filter(c => c.featured);
  const all = COMPANIES;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
          {all.length} COMPANIES · CYPRUS TECH
        </div>
        <h1 className="display-m" style={{ marginBottom: 8 }}>Companies hiring in Cyprus</h1>
        <p className="body" style={{ color: "var(--text-muted)", maxWidth: 560 }}>
          From global fintech giants to local scale-ups — these are the tech companies building in Cyprus right now.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 480, marginBottom: 48 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
        <input className="input" type="text" placeholder="Search companies…" style={{ paddingLeft: 36 }} />
      </div>

      {/* Featured */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 className="h2">Featured companies</h2>
            <p className="body-s" style={{ color: "var(--text-muted)", marginTop: 4 }}>Actively hiring this week</p>
          </div>
          <span className="tag tag-pulse tag-success">Live now</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {featured.map(co => <CompanyCard key={co.slug} company={co} large />)}
        </div>
      </div>

      {/* All companies */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
          <h2 className="h2">All companies</h2>
          <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{all.length} TOTAL</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {all.map(co => <CompanyCard key={co.slug} company={co} />)}
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 64, padding: 40, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <h2 className="h2" style={{ marginBottom: 6 }}>Is your company hiring?</h2>
          <p className="body" style={{ color: "var(--text-muted)" }}>Get your roles in front of Cyprus's top tech talent. Listings go live in minutes.</p>
        </div>
        <Link href="/post-a-job" className="btn btn-accent btn-lg">Post a job →</Link>
      </div>
    </div>
  );
}

function CompanyCard({ company: co, large = false }: { company: typeof COMPANIES[0]; large?: boolean }) {
  return (
    <Link
      href={`/companies/${co.slug}`}
      style={{
        display: "block", textDecoration: "none",
        border: "1px solid var(--border)", borderRadius: 10,
        padding: large ? 24 : 20,
        background: "var(--surface)",
        transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: large ? 16 : 12 }}>
        <div style={{ width: large ? 52 : 44, height: large ? 52 : 44, borderRadius: 8, background: co.bg, color: co.fg, display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: large ? 18 : 15, flexShrink: 0 }}>
          {co.initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: large ? 16 : 14, color: "var(--text)" }}>{co.name}</span>
            {co.verified && <span className="tag tag-success" style={{ fontSize: 10, padding: "2px 6px" }}>✓</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{co.city}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-strong)", display: "inline-block" }} />
            <span className="mono-s" style={{ color: "var(--accent)" }}>{co.openRoles} open roles</span>
          </div>
        </div>
      </div>

      {large && (
        <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {co.description}
        </p>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {co.tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{co.size}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
          <ExternalLink size={10} /> {co.website}
        </span>
      </div>
    </Link>
  );
}
