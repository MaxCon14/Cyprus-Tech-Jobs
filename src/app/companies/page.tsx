export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCompanies } from "@/lib/queries";
import { CompaniesClient } from "./CompaniesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies Hiring in Cyprus",
  description: "Browse tech companies hiring in Cyprus. See open roles, company profiles, and culture.",
};

export default async function CompaniesPage() {
  const companies = await getCompanies();
  const featured  = companies.filter(c => c.featured);

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

      <CompaniesClient companies={companies} featured={featured} />

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
