import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getJobCount, getCategoriesWithCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FilterBar } from "../FilterBar";
import { CITIES } from "@/lib/placeholder-data";
import { WORK_TYPE_LABELS } from "@/lib/taxonomy";
import { buildFAQSchema, jsonLd } from "@/lib/schema";

const PAGE_SIZE = 20;
const BASE_URL  = "https://cyprustech.careers";

export interface JobTypeConfig {
  /** Human label, e.g. "Full-time". */
  displayName: string;
  /** URL slug, e.g. "full-time". */
  slug: string;
  /** Schema enum value, e.g. "FULL_TIME". */
  employment: string;
  /** Unique intro paragraph for this job type. */
  description: string;
}

export interface JobTypeSearchParams {
  page?:     string;
  category?: string;
  type?:     string;
  skill?:    string;
  level?:    string;
  city?:     string;
  salary?:   string;
  search?:   string;
}

interface Props {
  config:       JobTypeConfig;
  searchParams: JobTypeSearchParams;
}

const OTHER_TYPES: Pick<JobTypeConfig, "displayName" | "slug">[] = [
  { displayName: "Full-time",  slug: "full-time"  },
  { displayName: "Part-time",  slug: "part-time"  },
  { displayName: "Contract",   slug: "contract"   },
  { displayName: "Internship", slug: "internship" },
  { displayName: "Freelance",  slug: "freelance"  },
];

const CITY_LINKS = [
  { displayName: "Limassol", slug: "limassol" },
  { displayName: "Nicosia",  slug: "nicosia"  },
  { displayName: "Larnaca",  slug: "larnaca"  },
  { displayName: "Paphos",   slug: "paphos"   },
  { displayName: "Remote",   slug: "remote"   },
];

export async function JobTypePage({ config, searchParams }: Props) {
  const { displayName, slug, employment, description } = config;
  const lower = displayName.toLowerCase();

  const { category, type, level, skill, search } = searchParams;
  const city    = searchParams.city && searchParams.city !== "Remote" ? searchParams.city : undefined;
  const salary  = searchParams.salary ? parseInt(searchParams.salary) : undefined;
  const pageNum = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const basePath = `/jobs/type/${slug}`;

  // Employment type is fixed by the path; the rest come from the filters.
  const filters = {
    employmentType:  employment,
    categorySlug:    category,
    remoteType:      type,
    experienceLevel: level,
    city,
    skill,
    salary,
    search: search?.trim() || undefined,
  };

  let jobs:       Awaited<ReturnType<typeof getJobs>> = [];
  let total     = 0;          // filtered — drives results + pagination
  let typeTotal = 0;          // the whole job type, unfiltered — for stable SEO copy
  let categories: Awaited<ReturnType<typeof getCategoriesWithCount>> = [];
  try {
    [jobs, total, typeTotal, categories] = await Promise.all([
      getJobs({ ...filters, take: PAGE_SIZE, skip: (pageNum - 1) * PAGE_SIZE }),
      getJobCount(filters),
      getJobCount({ employmentType: employment }),
      getCategoriesWithCount(),
    ]);
  } catch (err) { console.error(`[jobtype-jobs/${slug}] DB error:`, err); }

  const serialisedJobs = jobs.map(serialiseJob);
  const showFrom = total === 0 ? 0 : (pageNum - 1) * PAGE_SIZE + 1;
  const showTo   = Math.min(pageNum * PAGE_SIZE, total);
  const hasPrev  = pageNum > 1;
  const hasNext  = pageNum * PAGE_SIZE < total;

  const allCatNodes = [
    ...categories.slice(1),
    ...categories.slice(1).flatMap(p => p.children),
  ];
  function catLabel(s: string) { return allCatNodes.find(c => c.slug === s)?.label ?? s; }

  const activeFilters: { label: string; key: string }[] = [];
  if (search  ) activeFilters.push({ label: `"${search}"`,                          key: "search"   });
  if (category) activeFilters.push({ label: catLabel(category),                     key: "category" });
  if (type    ) activeFilters.push({ label: WORK_TYPE_LABELS[type] ?? type,         key: "type"     });
  if (skill   ) activeFilters.push({ label: skill,                                  key: "skill"    });
  if (level   ) activeFilters.push({ label: level,                                  key: "level"    });
  if (city    ) activeFilters.push({ label: city,                                   key: "city"     });
  if (salary  ) activeFilters.push({ label: `min €${(salary / 1000).toFixed(0)}k`, key: "salary"   });

  function urlWith(key: string, val: string | undefined) {
    const p = new URLSearchParams();
    const cur: Record<string, string | undefined> = {
      search, category, type, level, city, skill, salary: searchParams.salary,
    };
    cur[key] = val;
    for (const [k, v] of Object.entries(cur)) { if (v) p.set(k, v); }
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function pageUrl(p: number) {
    const up = new URLSearchParams();
    if (search             ) up.set("search",   search);
    if (category           ) up.set("category", category);
    if (type               ) up.set("type",     type);
    if (level              ) up.set("level",    level);
    if (city               ) up.set("city",     city);
    if (skill              ) up.set("skill",    skill);
    if (searchParams.salary) up.set("salary",   searchParams.salary);
    if (p > 1              ) up.set("page",      String(p));
    const qs = up.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const intro = `Browse ${typeTotal > 0 ? `${typeTotal} ` : ""}${lower} tech job${typeTotal === 1 ? "" : "s"} in Cyprus. `
    + description;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",     item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "All Jobs", item: `${BASE_URL}/jobs` },
      { "@type": "ListItem", position: 3, name: `${displayName} Tech Jobs in Cyprus`, item: `${BASE_URL}${basePath}` },
    ],
  };

  const itemListSchema = serialisedJobs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": serialisedJobs.map((j, i) => ({
      "@type": "ListItem",
      "position": (pageNum - 1) * PAGE_SIZE + i + 1,
      "url": `${BASE_URL}/jobs/${j.slug}`,
      "name": j.title,
    })),
  } : null;

  const faqs = [
    { question: `How many ${lower} tech jobs are available in Cyprus?`,
      answer: `There ${typeTotal === 1 ? "is" : "are"} currently ${typeTotal} ${lower} tech job${typeTotal === 1 ? "" : "s"} in Cyprus on CyprusTech.Careers, updated daily — across software engineering, DevOps, design, data and product. Every listing shows a verified salary.` },
    { question: `Where are ${lower} tech jobs in Cyprus based?`,
      answer: `${displayName} tech roles are concentrated in Limassol and Nicosia, with a growing number in Larnaca and Paphos, plus fully remote positions open to candidates anywhere in Cyprus. Use the city filter to narrow by location.` },
    { question: `What salary do ${lower} tech jobs in Cyprus pay?`,
      answer: `Pay for ${lower} tech roles in Cyprus typically ranges from about €35,000 for junior positions to €120,000+ for senior and lead roles, with fintech and forex companies at the top of the range. Every listing on CyprusTech.Careers shows the salary up front.` },
  ];
  const faqSchema = buildFAQSchema(faqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />

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
            {total}{activeFilters.length ? " MATCHING" : ""} JOB{total === 1 ? "" : "S"} · UPDATED DAILY
          </div>
          <h1 className="display-m" style={{ marginBottom: 12 }}>
            {displayName} Tech Jobs in Cyprus
          </h1>
          <p className="body" style={{ color: "var(--text-muted)", maxWidth: 620 }}>
            {intro}
          </p>
        </div>

        {/* Keyword search — carries active filters */}
        <form action={basePath} method="GET" style={{ marginBottom: 28 }}>
          {category            && <input type="hidden" name="category" value={category} />}
          {type                && <input type="hidden" name="type"     value={type} />}
          {level               && <input type="hidden" name="level"    value={level} />}
          {city                && <input type="hidden" name="city"     value={city} />}
          {skill               && <input type="hidden" name="skill"    value={skill} />}
          {searchParams.salary && <input type="hidden" name="salary"   value={searchParams.salary} />}
          <div style={{ position: "relative", maxWidth: 600 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <input
              className="input" type="text" name="search" defaultValue={search ?? ""}
              placeholder={`Search ${lower} jobs…`}
              style={{ paddingLeft: 40, paddingBlock: 12, fontSize: 15 }}
            />
          </div>
        </form>

        {/* Sidebar + content */}
        <div className="layout-sidebar-left" style={{ alignItems: "start" }}>

          {/* Filter sidebar (job type is fixed by the path) */}
          <FilterBar
            categories={categories}
            current={{ category, type, city, level, skill, salary: searchParams.salary, search }}
            cities={CITIES}
            basePath={basePath}
            hideEmploymentFilter
          />

          {/* Main content */}
          <div>

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

            <div style={{ marginBottom: 16 }}>
              <span className="body-s" style={{ color: "var(--text-muted)" }}>
                {total === 0
                  ? "No jobs found"
                  : <>Showing <strong style={{ color: "var(--text)" }}>{showFrom}–{showTo}</strong> of <strong style={{ color: "var(--text)" }}>{total}</strong> {activeFilters.length ? "matching " : ""}jobs</>
                }
              </span>
            </div>

            {serialisedJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                  {activeFilters.length ? `No ${lower} jobs match your filters` : `No ${lower} tech jobs open right now`}
                </div>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                  {activeFilters.length
                    ? "Try removing a filter, or browse all job types."
                    : "We add new listings daily. Browse all open roles or set up a job alert."}
                </p>
                <Link href={activeFilters.length ? basePath : "/jobs"} className="btn btn-accent">
                  {activeFilters.length ? `View all ${lower} jobs` : "Browse all jobs"}
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {serialisedJobs.map(job => <JobCard key={job.id} {...job} />)}
              </div>
            )}

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

            {/* FAQ — content depth + FAQ schema above */}
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
              <h2 className="h3" style={{ marginBottom: 16 }}>{displayName} tech jobs in Cyprus — FAQ</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {faqs.map(f => (
                  <div key={f.question}>
                    <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.question}</div>
                    <p className="body-s" style={{ color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal links — other job types */}
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 14 }}>BROWSE BY JOB TYPE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {OTHER_TYPES.filter(t => t.slug !== slug).map(t => (
                  <Link key={t.slug} href={`/jobs/type/${t.slug}`} className="chip">{t.displayName}</Link>
                ))}
              </div>
            </div>

            {/* Internal links — this job type by city */}
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 14 }}>{displayName.toUpperCase()} JOBS BY CITY</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CITY_LINKS.map(c => (
                  <Link key={c.slug} href={`/jobs/${c.slug}?employment=${employment}`} className="chip">
                    {displayName} in {c.displayName}
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
