export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { getCompanies } from "@/lib/queries";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { buildBreadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Tech Companies Hiring in Cyprus — CyprusTech.Careers",
  description:
    "Browse the tech companies hiring in Cyprus. See their team size, location, tech stack and current open roles.",
  alternates: { canonical: "https://cyprustech.careers/companies" },
  openGraph: {
    title: "Tech Companies Hiring in Cyprus",
    description: "Browse the tech companies hiring in Cyprus and their open roles.",
    url: "https://cyprustech.careers/companies",
    type: "website",
  },
};

export default async function CompaniesPage() {
  /* Directory members only — companies with a registered employer account.
     Curated listings never create a Company row, so admin-listed roles cannot
     surface a profile here by construction. */
  let companies: Awaited<ReturnType<typeof getCompanies>> = [];
  try {
    companies = await getCompanies({ withAccount: true });
  } catch {
    companies = [];
  }

  const totalRoles = companies.reduce((n, c) => n + c._count.jobs, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Companies", path: "/companies" },
        ])) }}
      />

      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", background: "var(--bg-alt)", minHeight: "100vh" }}>
        <div className="page-container">

          <div style={{ marginBottom: "clamp(28px, 4vw, 44px)", maxWidth: 680 }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Companies</div>
            <h1 className="display-m" style={{ marginBottom: 12 }}>Tech companies hiring in Cyprus</h1>
            <p className="body" style={{ color: "var(--text-muted)" }}>
              {companies.length === 0
                ? "Company profiles will appear here as employers join."
                : `${companies.length} ${companies.length === 1 ? "company has" : "companies have"} a profile on CyprusTech.Careers${totalRoles > 0 ? `, with ${totalRoles} open ${totalRoles === 1 ? "role" : "roles"} between them` : ""}.`}
            </p>
          </div>

          {companies.length === 0 ? (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "40px 24px", textAlign: "center",
            }}>
              <p className="body" style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                No company profiles yet.
              </p>
              <Link href="/jobs" className="btn btn-accent">Browse all jobs</Link>
            </div>
          ) : (
            <div className="company-grid">
              {companies.map(c => (
                <CompanyCard
                  key={c.id}
                  name={c.name}
                  slug={c.slug}
                  logoUrl={c.logoUrl}
                  description={c.description}
                  city={c.city}
                  size={c.size}
                  techStack={c.techStack}
                  verified={c.verified}
                  featured={c.featured}
                  openRoles={c._count.jobs}
                />
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
