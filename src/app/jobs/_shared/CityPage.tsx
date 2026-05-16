import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getJobCount, getCategoriesWithCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FilterBar } from "../FilterBar";
import { CITIES } from "@/lib/placeholder-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PAGE_SIZE = 20;
const BASE_URL  = "https://cyprustech.careers";

export interface CityConfig {
  displayName: string;
  slug: string;
  city?: string;
  isRemote?: boolean;
  description: string;
}

export interface CitySearchParams {
  page?:     string;
  category?: string;
  type?:     string;
  level?:    string;
  salary?:   string;
  search?:   string;
}

interface Props {
  config:       CityConfig;
  searchParams: CitySearchParams;
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME:  "Full-time",
  PART_TIME:  "Part-time",
  CONTRACT:   "Contract",
  INTERNSHIP: "Internship",
  FREELANCE:  "Freelance",
};

export async function CityPage({ config, searchParams }: Props) {
  const { displayName, slug, city, isRemote, description } = config;

  const { category, type, level, search } = searchParams;
  const salary  = searchParams.salary ? parseInt(searchParams.salary) : undefined;
  const pageNum = Math.max(1, parseInt(searchParams.page ?? "1") || 1);

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  /* Base city/remote filter + user-selected filters */
  const filters = {
    ...(isRemote ? { remoteType: "REMOTE" as const } : { city }),
    categorySlug:    category,
    experienceLevel: level,
    search:          search?.trim() || undefined,
    salary,
    /* Only apply type filter on non-remote pages (remote page base is already REMOTE) */
    ...(!isRemote && type ? { remoteType: type } : {}),
  };

  let jobs:       Awaited<ReturnType<typeof getJobs>> = [];
  let total     = 0;
  let categories: Awaited<ReturnType<typeof getCategoriesWithCount>> = [];

  try {
    [jobs, total, categories] = await Promise.all([
      getJobs({ ...filters, take: PAGE_SIZE, skip: (pageNum - 1) * PAGE_SIZE }),
      getJobCount(filters),
      getCategoriesWithCount(),
    ]);
  } catch (err) { console.error(`[city-jobs/${slug}] DB error:`, err); }

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
  const showFrom = total === 0 ? 0 : (pageNum - 1) * PAGE_SIZE + 1;
  const showTo   = Math.min(pageNum * PAGE_SIZE, total);
  const hasPrev  = pageNum > 1;
  const hasNext  = pageNum * PAGE_SIZE < total;

  const basePath = `/jobs/${slug}`;

  /* Active filter labels */
  const allCatNodes = [
    ...categories.slice(1),
    ...categories.slice(1).flatMap(p => p.children),
  ];
  function catLabel(s: string) { return allCatNodes.find(c => c.slug === s)?.label ?? s; }

  const activeFilters: { label: string; key: string }[] = [];
  if (search  ) activeFilters.push({ label: `"${search}"`,                          key: "search"   });
  if (category) activeFilters.push({ label: catLabel(category),                     key: "category" });
  if (!isRemote && type) activeFilters.push({ label: TYPE_LABELS[type] ?? type,     key: "type"     });
  if (level   ) activeFilters.push({ label: level,                                  key: "level"    });
  if (salary  ) activeFilters.push({ label: `min €${(salary / 1000).toFixed(0)}k`, key: "salary"   });

  /* URL builder — removes one filter param while keeping others + city base */
  function urlWith(key: string, val: string | undefined) {
    const p = new URLSearchParams();
    const cur: Record<string, string | undefined> = {
      search, category, level, salary: searchParams.salary,
      ...(!isRemote ? { type } : {}),
    };
    cur[key] = val;
    for (const [k, v] of Object.entries(cur)) { if (v) p.set(k, v); }
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function pageUrl(p: number) {
    const up = new URLSearchParams();
    if (search          ) up.set("search",   search);
    if (category        ) up.set("category", category);
    if (!isRemote && type) up.set("type",    type);
    if (level           ) up.set("level",    level);
    if (searchParams.salary) up.set("salary", searchParams.salary);
    if (p > 1           ) up.set("page",     String(p));
    const qs = up.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  /* Breadcrumb JSON-LD */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",     item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "All Jobs", item: `${BASE_URL}/jobs` },
      { "@type": "ListItem", position: 3, name: `Tech Jobs in ${displayName}`, item: `${BASE_URL}/jobs/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="page-container" style={{ paddingBlock: "clamp(24px, 4vw, 40px)" }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--text-muted)" }}>
            <Link href="/"     style={{ color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/jobs" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Jobs</Link>
            <span>/</span>
            <span style={{ color: "var(--text)" }}>{displayName}</span>
          </div>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            {total} JOBS · UPDATED DAILY
          </div>
          <h1 className="display-m" style={{ marginBottom: 12 }}>
            Tech Jobs in {displayName}
          </h1>
          <p className="body" style={{ color: "var(--text-muted)", maxWidth: 560 }}>
            {description}
          </p>
        </div>

        {/* Keyword search */}
        <form action={basePath} method="GET" style={{ marginBottom: 24 }}>
          {category          && <input type="hidden" name="category" value={category} />}
          {!isRemote && type && <input type="hidden" name="type"     value={type} />}
          {level             && <input type="hidden" name="level"    value={level} />}
          {searchParams.salary && <input type="hidden" name="salary" value={searchParams.salary} />}
          <div style={{ position: "relative", maxWidth: 600 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <input
              className="input"
              type="text"
              name="search"
              defaultValue={search ?? ""}
              placeholder="Search by title, company, or keyword…"
              style={{ paddingLeft: 40, paddingBlock: 12, fontSize: 15 }}
            />
          </div>
        </form>

        {/* Sidebar + content */}
        <div className="layout-sidebar-left" style={{ alignItems: "start" }}>

          {/* Filter sidebar */}
          <FilterBar
            categories={categories}
            current={{ category, type, level, salary: searchParams.salary, search }}
            cities={CITIES}
            basePath={basePath}
            hideCityFilter
            hideTypeFilter={isRemote}
          />

          {/* Main content */}
          <div>

            {/* Active filter pills */}
            {activeFilters.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
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
                <Link href={basePath} style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-subtle)", textDecoration: "none" }}>
                  Clear all
                </Link>
              </div>
            )}

            {/* Results count */}
            <div style={{ marginBottom: 16 }}>
              <span className="body-s" style={{ color: "var(--text-muted)" }}>
                {total === 0
                  ? "No jobs found"
                  : <>Showing <strong style={{ color: "var(--text)" }}>{showFrom}–{showTo}</strong> of <strong style={{ color: "var(--text)" }}>{total}</strong> {activeFilters.length ? "matching " : ""}jobs</>
                }
              </span>
            </div>

            {/* Job list */}
            {serialisedJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                  {activeFilters.length ? "No jobs match your filters" : `No jobs in ${displayName} right now`}
                </div>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                  {activeFilters.length
                    ? "Try removing a filter or browsing all jobs."
                    : "We're adding new listings daily. Browse all open roles or set up a job alert."}
                </p>
                <Link href={activeFilters.length ? basePath : "/jobs"} className="btn btn-accent">
                  {activeFilters.length ? "Clear filters" : "Browse all jobs"}
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {serialisedJobs.map(job => (
                  <JobCard key={job.id} {...job} savedJobIds={savedJobIds} />
                ))}
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

            {/* SEO internal links to other cities */}
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 14 }}>BROWSE JOBS BY CITY</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {OTHER_CITIES.filter(c => c.slug !== slug).map(c => (
                  <Link key={c.slug} href={`/jobs/${c.slug}`} className="chip">
                    {c.displayName}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const OTHER_CITIES: Pick<CityConfig, "displayName" | "slug">[] = [
  { displayName: "Nicosia",  slug: "nicosia"  },
  { displayName: "Limassol", slug: "limassol" },
  { displayName: "Larnaca",  slug: "larnaca"  },
  { displayName: "Paphos",   slug: "paphos"   },
  { displayName: "Remote",   slug: "remote"   },
];
