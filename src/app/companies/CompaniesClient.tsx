"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import type { getCompanies } from "@/lib/queries";

type Company = Awaited<ReturnType<typeof getCompanies>>[0];

export function CompaniesClient({
  companies,
  featured,
}: {
  companies: Company[];
  featured:  Company[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered     = q ? companies.filter(co =>
    co.name.toLowerCase().includes(q) ||
    (co.city ?? "").toLowerCase().includes(q) ||
    (co.website ?? "").toLowerCase().includes(q)
  ) : companies;

  const filteredFeatured = q ? featured.filter(co =>
    co.name.toLowerCase().includes(q) ||
    (co.city ?? "").toLowerCase().includes(q) ||
    (co.website ?? "").toLowerCase().includes(q)
  ) : featured;

  const isSearching = q.length > 0;

  return (
    <>
      {/* Search */}
      <div style={{ position: "relative", maxWidth: 480, marginBottom: 48 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
        <input
          className="input"
          type="text"
          placeholder="Search companies…"
          style={{ paddingLeft: 36 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Featured — hidden while searching */}
      {!isSearching && filteredFeatured.length > 0 && (
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 className="h2">Featured companies</h2>
              <p className="body-s" style={{ color: "var(--text-muted)", marginTop: 4 }}>Actively hiring this week</p>
            </div>
            <span className="tag tag-pulse tag-success">Live now</span>
          </div>
          <div className="grid-3">
            {filteredFeatured.map(co => <CompanyCard key={co.slug} company={co} large />)}
          </div>
        </div>
      )}

      {/* All / search results */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
          <h2 className="h2">{isSearching ? `Results for "${query.trim()}"` : "All companies"}</h2>
          <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{filtered.length} {isSearching ? "FOUND" : "TOTAL"}</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p className="body-s" style={{ fontWeight: 600, marginBottom: 6 }}>No companies found</p>
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20 }}>
              Try a different name or city.
            </p>
            <button className="btn btn-outline" onClick={() => setQuery("")}>Clear search</button>
          </div>
        ) : (
          <div className="grid-2" style={{ gap: 12 }}>
            {filtered.map(co => <CompanyCard key={co.slug} company={co} />)}
          </div>
        )}
      </div>
    </>
  );
}

function CompanyCard({ company: co, large = false }: { company: Company; large?: boolean }) {
  const openRoles = co._count.jobs;
  return (
    <Link
      href={`/companies/${co.slug}`}
      style={{ display: "block", textDecoration: "none", border: "1px solid var(--border)", borderRadius: 10, padding: large ? 24 : 20, background: "var(--surface)", transition: "all 200ms cubic-bezier(0.16,1,0.3,1)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: large ? 16 : 12 }}>
        <div style={{ width: large ? 52 : 44, height: large ? 52 : 44, borderRadius: 8, flexShrink: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
          {co.logoUrl
            ? <img src={co.logoUrl} alt={co.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "var(--black)", color: "var(--white)", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: large ? 18 : 15 }}>{co.name.charAt(0)}</div>
          }
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
