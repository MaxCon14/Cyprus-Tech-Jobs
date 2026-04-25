import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getCategoriesWithCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { CITIES } from "@/lib/placeholder-data";
import { SlidersHorizontal, Search } from "lucide-react";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Tech Jobs in Cyprus",
  description: "Browse all tech jobs in Cyprus. Filter by category, location, remote type, and salary.",
};

const REMOTE_OPTIONS = [
  { label: "Remote",  value: "REMOTE" },
  { label: "Hybrid",  value: "HYBRID" },
  { label: "On-site", value: "ON_SITE" },
];

const EXPERIENCE_OPTIONS = [
  { label: "Junior",    value: "JUNIOR" },
  { label: "Mid-level", value: "MID" },
  { label: "Senior",    value: "SENIOR" },
  { label: "Lead",      value: "LEAD" },
];

export default async function JobsPage() {
  const [jobs, categories] = await Promise.all([
    getJobs({ take: 20 }),
    getCategoriesWithCount(),
  ]);

  const serialisedJobs = jobs.map(serialiseJob);
  const totalJobs      = categories[0]?.count ?? 0;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

      <div style={{ marginBottom: 32 }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
          {totalJobs} JOBS · UPDATED DAILY
        </div>
        <h1 className="display-m" style={{ marginBottom: 8 }}>Tech jobs in Cyprus</h1>
        <p className="body" style={{ color: "var(--text-muted)" }}>
          Curated roles at the best tech companies — salaries included, no recruiter noise.
        </p>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, maxWidth: 680 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
          <input className="input" type="text" placeholder="Job title, company, skill…" style={{ paddingLeft: 36 }} />
        </div>
        <select className="select" style={{ width: 170 }}>
          <option value="">All locations</option>
          {CITIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
        </select>
        <button className="btn btn-accent">Search</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 40, alignItems: "start" }}>

        {/* Filters sidebar */}
        <aside>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <SlidersHorizontal size={14} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13 }}>Filters</span>
            </div>

            <FilterSection title="Category">
              {categories.slice(1).map(cat => (
                <FilterCheckbox key={cat.slug} label={cat.label} count={cat.count} />
              ))}
            </FilterSection>

            <FilterSection title="Work type">
              {REMOTE_OPTIONS.map(o => <FilterCheckbox key={o.value} label={o.label} />)}
            </FilterSection>

            <FilterSection title="Experience">
              {EXPERIENCE_OPTIONS.map(o => <FilterCheckbox key={o.value} label={o.label} />)}
            </FilterSection>

            <FilterSection title="City">
              {CITIES.map(c => <FilterCheckbox key={c} label={c} />)}
            </FilterSection>

            <FilterSection title="Salary (annual)" last>
              {["Up to €40K","€40K – €60K","€60K – €80K","€80K – €100K","€100K+"].map(s => (
                <FilterCheckbox key={s} label={s} />
              ))}
            </FilterSection>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
            Clear all filters
          </button>
        </aside>

        {/* Job list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span className="body-s" style={{ color: "var(--text-muted)" }}>
              Showing <strong style={{ color: "var(--text)" }}>{serialisedJobs.length}</strong> of {totalJobs} jobs
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="body-s" style={{ color: "var(--text-muted)" }}>Sort by</span>
              <select className="select" style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}>
                <option>Most recent</option>
                <option>Salary: high to low</option>
                <option>Salary: low to high</option>
              </select>
            </div>
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {categories.map((cat, i) => (
              <Link key={cat.slug} href={cat.slug ? `/jobs/category/${cat.slug}` : "/jobs"} className={`chip${i === 0 ? " chip-active" : ""}`}>
                {cat.label} <span className="chip-count">{cat.count}</span>
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {serialisedJobs.map(job => <JobCard key={job.id} {...job} />)}
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 32 }}>
            {["←", "1", "2", "3", "→"].map((p, i) => (
              <button key={i} className={`btn btn-sm ${p === "1" ? "btn-primary" : "btn-ghost"}`} style={{ minWidth: 36, justifyContent: "center" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: "16px", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, count }: { label: string; count?: number }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 16, height: 16, border: "1.5px solid var(--border-strong)", borderRadius: 4, display: "inline-block", flexShrink: 0 }} />
        <span className="body-s">{label}</span>
      </div>
      {count !== undefined && <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{count}</span>}
    </label>
  );
}
