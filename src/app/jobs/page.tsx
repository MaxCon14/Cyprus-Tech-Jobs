import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getCategoriesWithCount, getJobCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { CITIES } from "@/lib/placeholder-data";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FiltersPanel } from "./FiltersPanel";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

const SALARY_OPTIONS = [
  { label: "€30k+",  value: 30000 },
  { label: "€50k+",  value: 50000 },
  { label: "€70k+",  value: 70000 },
  { label: "€100k+", value: 100000 },
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

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  category?: string;
  type?: string;
  city?: string;
  level?: string;
  search?: string;
  salary?: string;
  page?: string;
}>;

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { category, type, city, level, search } = params;
  const salary  = params.salary ? parseInt(params.salary) : undefined;
  const pageNum = Math.max(1, parseInt(params.page ?? "1") || 1);

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const filters = {
    categorySlug:    category,
    remoteType:      type,
    city:            city && city !== "Remote" ? city : undefined,
    experienceLevel: level,
    search:          search?.trim() || undefined,
    salary,
  };

  let jobs: Awaited<ReturnType<typeof getJobs>> = [];
  let filteredTotal = 0;
  let categories: Awaited<ReturnType<typeof getCategoriesWithCount>> = [];

  try {
    [jobs, filteredTotal, categories] = await Promise.all([
      getJobs({ ...filters, take: PAGE_SIZE, skip: (pageNum - 1) * PAGE_SIZE }),
      getJobCount(filters),
      getCategoriesWithCount(),
    ]);
  } catch (err) { console.error("[jobs] DB error:", err); }

  let savedJobIds: string[] | undefined;
  if (user?.email) {
    const { data: candidate } = await supabaseAdmin
      .from("candidates").select("id").eq("email", user.email).single();
    if (candidate) {
      const { data: saved } = await supabaseAdmin
        .from("saved_jobs").select("jobId").eq("candidateId", candidate.id);
      savedJobIds = (saved ?? []).map((r: { jobId: string }) => r.jobId);
    }
  }

  const serialisedJobs = jobs.map(serialiseJob);
  const totalJobs      = categories[0]?.count ?? 0;
  const showFrom       = filteredTotal === 0 ? 0 : (pageNum - 1) * PAGE_SIZE + 1;
  const showTo         = Math.min(pageNum * PAGE_SIZE, filteredTotal);
  const hasPrev        = pageNum > 1;
  const hasNext        = pageNum * PAGE_SIZE < filteredTotal;

  /* Unified URL builder — sets/clears one param, resets page */
  function urlWith(key: string, val: string | undefined) {
    const p = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      search, category, type, city, level,
      salary: params.salary,
    };
    current[key] = val;
    for (const [k, v] of Object.entries(current)) {
      if (v) p.set(k, v);
    }
    const qs = p.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  }

  /* Page navigation — keeps all current filters */
  function pageUrl(p: number) {
    const up = new URLSearchParams();
    if (search         ) up.set("search",   search);
    if (category       ) up.set("category", category);
    if (type           ) up.set("type",     type);
    if (city           ) up.set("city",     city);
    if (level          ) up.set("level",    level);
    if (params.salary  ) up.set("salary",   params.salary);
    if (p > 1          ) up.set("page",     String(p));
    const qs = up.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  }

  /* Active filter pills */
  const activeFilters: { label: string; key: string }[] = [];
  if (search  ) activeFilters.push({ label: `"${search}"`,                                     key: "search" });
  if (category) activeFilters.push({ label: CATEGORY_LABELS[category] ?? category,             key: "category" });
  if (type    ) activeFilters.push({ label: TYPE_LABELS[type] ?? type,                         key: "type" });
  if (city    ) activeFilters.push({ label: city,                                               key: "city" });
  if (level   ) activeFilters.push({ label: level,                                              key: "level" });
  if (salary  ) activeFilters.push({ label: `min €${(salary / 1000).toFixed(0)}k`,             key: "salary" });

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
          {filteredTotal} {activeFilters.length ? "matching" : "total"} JOBS · UPDATED DAILY
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
              key={f.key}
              href={urlWith(f.key, undefined)}
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

      {/* Keyword search — always visible above the grid */}
      <form action="/jobs" method="GET" style={{ marginBottom: 20, maxWidth: "100%" }}>
        {category       && <input type="hidden" name="category" value={category} />}
        {type           && <input type="hidden" name="type"     value={type} />}
        {city           && <input type="hidden" name="city"     value={city} />}
        {level          && <input type="hidden" name="level"    value={level} />}
        {params.salary  && <input type="hidden" name="salary"   value={params.salary} />}
        <div style={{ position: "relative", maxWidth: 480 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
          <input
            className="input"
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search by title, company, or keyword…"
            style={{ paddingLeft: 36 }}
          />
        </div>
      </form>

      <div className="layout-sidebar-left">

        {/* Filters sidebar — collapsible on mobile */}
        <FiltersPanel activeCount={activeFilters.length}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <FilterSection title="Category">
              {categories.slice(1).map(cat => (
                <FilterLink
                  key={cat.slug}
                  label={cat.label}
                  count={cat.count}
                  href={urlWith("category", category === cat.slug ? undefined : cat.slug)}
                  active={category === cat.slug}
                />
              ))}
            </FilterSection>

            <FilterSection title="Work type">
              {REMOTE_OPTIONS.map(o => (
                <FilterLink
                  key={o.value}
                  label={o.label}
                  href={urlWith("type", type === o.value ? undefined : o.value)}
                  active={type === o.value}
                />
              ))}
            </FilterSection>

            <FilterSection title="Experience">
              {EXPERIENCE_OPTIONS.map(o => (
                <FilterLink
                  key={o.value}
                  label={o.label}
                  href={urlWith("level", level === o.value ? undefined : o.value)}
                  active={level === o.value}
                />
              ))}
            </FilterSection>

            <FilterSection title="City">
              {CITIES.map(c => (
                <FilterLink
                  key={c}
                  label={c}
                  href={urlWith("city", city === c ? undefined : c)}
                  active={city === c}
                />
              ))}
            </FilterSection>

            <FilterSection title="Min salary" last>
              {SALARY_OPTIONS.map(o => (
                <FilterLink
                  key={o.value}
                  label={o.label}
                  href={urlWith("salary", salary === o.value ? undefined : String(o.value))}
                  active={salary === o.value}
                />
              ))}
            </FilterSection>
          </div>
          <Link href="/jobs" className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 10, textDecoration: "none" }}>
            Clear all filters
          </Link>
        </FiltersPanel>

        {/* Job list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <span className="body-s" style={{ color: "var(--text-muted)" }}>
              {filteredTotal === 0
                ? "No jobs found"
                : <>Showing <strong style={{ color: "var(--text)" }}>{showFrom}–{showTo}</strong> of <strong style={{ color: "var(--text)" }}>{filteredTotal}</strong> {activeFilters.length ? "matching " : ""}jobs</>
              }
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
              {serialisedJobs.map(job => <JobCard key={job.id} {...job} savedJobIds={savedJobIds} />)}
            </div>
          )}

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28, gap: 8 }}>
              {hasPrev ? (
                <Link href={pageUrl(pageNum - 1)} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ChevronLeft size={14} /> Previous
                </Link>
              ) : <div />}
              <span className="mono-s" style={{ color: "var(--text-subtle)" }}>Page {pageNum}</span>
              {hasNext ? (
                <Link href={pageUrl(pageNum + 1)} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Next <ChevronRight size={14} />
                </Link>
              ) : <div />}
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
