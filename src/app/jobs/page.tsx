import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getCategoriesWithCount, getJobCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { CITIES } from "@/lib/placeholder-data";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FilterBar } from "./FilterBar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Tech Jobs in Cyprus",
  description: "Browse all tech jobs in Cyprus. Filter by category, location, employment type, and salary.",
};

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME:  "Full-time",
  PART_TIME:  "Part-time",
  CONTRACT:   "Contract",
  INTERNSHIP: "Internship",
  FREELANCE:  "Freelance",
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

  /* Flat category lookup for label resolution (parents + all children) */
  const allCatNodes = [
    ...categories.slice(1),
    ...categories.slice(1).flatMap(p => p.children),
  ];
  function catLabel(slug: string) { return allCatNodes.find(c => c.slug === slug)?.label ?? slug; }

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
  if (search  ) activeFilters.push({ label: `"${search}"`,                          key: "search"   });
  if (category) activeFilters.push({ label: catLabel(category),                     key: "category" });
  if (type    ) activeFilters.push({ label: TYPE_LABELS[type] ?? type,              key: "type"     });
  if (city    ) activeFilters.push({ label: city,                                   key: "city"     });
  if (level   ) activeFilters.push({ label: level,                                  key: "level"    });
  if (salary  ) activeFilters.push({ label: `min €${(salary / 1000).toFixed(0)}k`, key: "salary"   });

  const pageTitle = category
    ? `${catLabel(category)} Jobs in Cyprus`
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

      {/* Keyword search */}
      <form action="/jobs" method="GET" style={{ marginBottom: 16, maxWidth: "100%" }}>
        {category      && <input type="hidden" name="category" value={category} />}
        {type          && <input type="hidden" name="type"     value={type} />}
        {city          && <input type="hidden" name="city"     value={city} />}
        {level         && <input type="hidden" name="level"    value={level} />}
        {params.salary && <input type="hidden" name="salary"   value={params.salary} />}
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

      {/* Filter dropdowns */}
      <FilterBar
        categories={categories}
        current={{ category, type, city, level, salary: params.salary, search }}
        cities={CITIES}
      />

      {/* Results header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <span className="body-s" style={{ color: "var(--text-muted)" }}>
          {filteredTotal === 0
            ? "No jobs found"
            : <>Showing <strong style={{ color: "var(--text)" }}>{showFrom}–{showTo}</strong> of <strong style={{ color: "var(--text)" }}>{filteredTotal}</strong> {activeFilters.length ? "matching " : ""}jobs</>
          }
        </span>
      </div>

      {/* Category chips (parent categories only) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <Link href="/jobs" className={`chip${!category ? " chip-active" : ""}`}>
          All <span className="chip-count">{totalJobs}</span>
        </Link>
        {categories.slice(1).map(cat => {
          const isActive = category === cat.slug || cat.children.some(ch => ch.slug === category);
          return (
            <Link
              key={cat.slug}
              href={`/jobs?category=${cat.slug}`}
              className={`chip${isActive ? " chip-active" : ""}`}
            >
              {cat.label} <span className="chip-count">{cat.count}</span>
            </Link>
          );
        })}
      </div>

      {/* Job list */}
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
  );
}
