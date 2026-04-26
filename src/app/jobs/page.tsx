import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getCategoriesWithCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { CITIES } from "@/lib/placeholder-data";
import { SlidersHorizontal, Search, X } from "lucide-react";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Tech Jobs in Cyprus",
  description: "Browse all tech jobs in Cyprus. Filter by category, location, employment type, and salary.",
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

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT:  "Contract",
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend:  "Backend",
  devops:   "DevOps & Cloud",
  design:   "UI/UX Design",
  data:     "Data & Analytics",
  mobile:   "Mobile",
  product:  "Product",
  security: "Security",
  qa:       "QA & Testing",
};

type SearchParams = Promise<{
  category?: string;
  type?: string;
  city?: string;
  level?: string;
}>;

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { category, type, city, level } = params;

  const [jobs, categories] = await Promise.all([
    getJobs({
      categorySlug:    category,
      remoteType:      type,
      city:            city && city !== "Remote" ? city : undefined,
      experienceLevel: level,
      take: 20,
    }),
    getCategoriesWithCount(),
  ]);

  const serialisedJobs = jobs.map(serialiseJob);
  const totalJobs      = categories[0]?.count ?? 0;

  /* Active filter pills */
  const activeFilters: { label: string; removeKey: string }[] = [];
  if (category) activeFilters.push({ label: CATEGORY_LABELS[category] ?? category, removeKey: "category" });
  if (type)     activeFilters.push({ label: TYPE_LABELS[type] ?? type, removeKey: "type" });
  if (city)     activeFilters.push({ label: city, removeKey: "city" });
  if (level)    activeFilters.push({ label: level, removeKey: "level" });

  function buildUrl(remove: string) {
    const p = new URLSearchParams();
    if (category && remove !== "category") p.set("category", category);
    if (type     && remove !== "type")     p.set("type", type);
    if (city     && remove !== "city")     p.set("city", city);
    if (level    && remove !== "level")    p.set("level", level);
    const qs = p.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  }

  const pageTitle = category
    ? `${CATEGORY_LABELS[category] ?? category} Jobs in Cyprus`
    : city
      ? `Tech Jobs in ${city}`
      : type
        ? `${TYPE_LABELS[type] ?? type} Tech Jobs in Cyprus`
        : "Tech Jobs in Cyprus";

  return (
    <div className="page-container" style={{ paddingBlock: "clamp(24px, 4vw, 40px)" }}>

      <div style={{ marginBottom: 32 }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
          {serialisedJobs.length} {activeFilters.length ? "matching" : "total"} JOBS · UPDATED DAILY
        </div>
        <h1 className="display-m" style={{ marginBottom: 8 }}>{pageTitle}</h1>
        <p className="body" style={{ color: "var(--text-muted)" }}>
          Curated roles at the best tech companies — salaries included, no recruiter noise.
        </p>
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          <span className="mono-s" style={{ color: "var(--text-subtle)" }}>FILTERED BY:</span>
          {activeFilters.map(f => (
            <Link
              key={f.removeKey}
              href={buildUrl(f.removeKey)}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 99, fontSize: 12, fontFamily: "var(--font-sans)", textDecoration: "none", fontWeight: 500 }}
            >
              {f.label} <X size={11} />
            </Link>
          ))}
          <Link href="/jobs" style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-subtle)", textDecoration: "none" }}>
            Clear all
          </Link>
        </div>
      )}

      <div className="layout-sidebar-left">

        {/* Filters sidebar */}
        <aside>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <SlidersHorizontal size={14} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13 }}>Filters</span>
            </div>

            <FilterSection title="Category">
              {categories.slice(1).map(cat => (
                <FilterLink
                  key={cat.slug}
                  label={cat.label}
                  count={cat.count}
                  href={`/jobs?category=${cat.slug}${type ? `&type=${type}` : ""}${city ? `&city=${city}` : ""}`}
                  active={category === cat.slug}
                />
              ))}
            </FilterSection>

            <FilterSection title="Work type">
              {REMOTE_OPTIONS.map(o => (
                <FilterLink
                  key={o.value}
                  label={o.label}
                  href={`/jobs?${category ? `category=${category}&` : ""}type=${o.value}${city ? `&city=${city}` : ""}`}
                  active={type === o.value}
                />
              ))}
            </FilterSection>

            <FilterSection title="Experience">
              {EXPERIENCE_OPTIONS.map(o => (
                <FilterLink
                  key={o.value}
                  label={o.label}
                  href={`/jobs?${category ? `category=${category}&` : ""}level=${o.value}${city ? `&city=${city}` : ""}`}
                  active={level === o.value}
                />
              ))}
            </FilterSection>

            <FilterSection title="City" last>
              {CITIES.map(c => (
                <FilterLink
                  key={c}
                  label={c}
                  href={`/jobs?${category ? `category=${category}&` : ""}city=${c}`}
                  active={city === c}
                />
              ))}
            </FilterSection>
          </div>
          <Link href="/jobs" className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 10, textDecoration: "none" }}>
            Clear all filters
          </Link>
        </aside>

        {/* Job list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <span className="body-s" style={{ color: "var(--text-muted)" }}>
              Showing <strong style={{ color: "var(--text)" }}>{serialisedJobs.length}</strong>
              {activeFilters.length ? " matching" : ""} jobs
            </span>
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <Link href="/jobs" className={`chip${!category ? " chip-active" : ""}`}>
              All <span className="chip-count">{totalJobs}</span>
            </Link>
            {categories.slice(1).map(cat => (
              <Link
                key={cat.slug}
                href={`/jobs?category=${cat.slug}`}
                className={`chip${category === cat.slug ? " chip-active" : ""}`}
              >
                {cat.label} <span className="chip-count">{cat.count}</span>
              </Link>
            ))}
          </div>

          {serialisedJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>No jobs match your filters</div>
              <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20 }}>Try removing a filter or browsing all jobs.</p>
              <Link href="/jobs" className="btn btn-outline">View all jobs</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {serialisedJobs.map(job => <JobCard key={job.id} {...job} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: "16px", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  );
}

function FilterLink({ label, count, href, active }: { label: string; count?: number; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "5px 8px", borderRadius: 6, textDecoration: "none",
        background: active ? "var(--accent-soft)" : "transparent",
        transition: "background 100ms ease",
      }}
    >
      <span className="body-s" style={{ color: active ? "var(--accent)" : "var(--text)", fontWeight: active ? 500 : 400 }}>
        {label}
      </span>
      {count !== undefined && (
        <span className="mono-s" style={{ color: active ? "var(--accent)" : "var(--text-subtle)" }}>{count}</span>
      )}
    </Link>
  );
}
