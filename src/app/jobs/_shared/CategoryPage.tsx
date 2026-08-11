import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getJobCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { CITIES } from "@/lib/placeholder-data";
import { EMPLOYMENT_LABELS, WORK_TYPE_LABELS, EXPERIENCE_LABELS } from "@/lib/taxonomy";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FilterBar } from "../FilterBar";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { buildBreadcrumbSchema, buildFAQSchema, jsonLd } from "@/lib/schema";

const PAGE_SIZE = 20;
const BASE_URL  = "https://cyprustech.careers";

/* Cities linked at the foot of the page for internal SEO — the category
   crossed with each city. Distinct from the FilterBar's in-page city filter. */
const CITY_LINKS = [
  { displayName: "Limassol", slug: "limassol" },
  { displayName: "Nicosia",  slug: "nicosia"  },
  { displayName: "Larnaca",  slug: "larnaca"  },
  { displayName: "Paphos",   slug: "paphos"   },
  { displayName: "Remote",   slug: "remote"   },
];

const JOB_TYPE_LINKS = [
  { displayName: "Full-time",  slug: "full-time"  },
  { displayName: "Part-time",  slug: "part-time"  },
  { displayName: "Contract",   slug: "contract"   },
  { displayName: "Internship", slug: "internship" },
  { displayName: "Freelance",  slug: "freelance"  },
];

export interface CategoryNode {
  name: string;
  slug: string;
  parent: { name: string; slug: string } | null;
  children: { name: string; slug: string }[];
}

interface Props {
  category: CategoryNode;
  searchParams: {
    page?:       string;
    search?:     string;
    type?:       string;
    employment?: string;
    level?:      string;
    city?:       string;
    salary?:     string;
    skill?:      string;
  };
}

export async function CategoryPage({ category, searchParams }: Props) {
  const { name, slug } = category;

  const search     = searchParams.search?.trim() || undefined;
  const type       = searchParams.type       || undefined;
  const employment = searchParams.employment || undefined;
  const level      = searchParams.level      || undefined;
  const city       = searchParams.city && searchParams.city !== "Remote" ? searchParams.city : undefined;
  const skill      = searchParams.skill      || undefined;
  const salary     = searchParams.salary ? parseInt(searchParams.salary) : undefined;
  const pageNum    = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const basePath   = `/jobs/category/${slug}`;

  // The path scopes every query to this category; the rest come from the filters.
  const filters = {
    categorySlug:    slug,
    remoteType:      type,
    employmentType:  employment,
    experienceLevel: level,
    city,
    skill,
    salary,
    search,
  };

  let jobs: Awaited<ReturnType<typeof getJobs>> = [];
  let total = 0;          // matches the active filters — drives results + pagination
  let categoryTotal = 0;  // the whole category, unfiltered — drives the SEO intro copy
  try {
    [jobs, total, categoryTotal] = await Promise.all([
      getJobs({ ...filters, take: PAGE_SIZE, skip: (pageNum - 1) * PAGE_SIZE }),
      getJobCount(filters),
      getJobCount({ categorySlug: slug }),
    ]);
  } catch (err) { console.error(`[category-jobs/${slug}] DB error:`, err); }

  const serialisedJobs = jobs.map(serialiseJob);
  const showFrom = total === 0 ? 0 : (pageNum - 1) * PAGE_SIZE + 1;
  const showTo   = Math.min(pageNum * PAGE_SIZE, total);
  const hasPrev  = pageNum > 1;
  const hasNext  = pageNum * PAGE_SIZE < total;

  /* URL builder — removes one filter param, keeping the rest. */
  function urlWith(key: string, val: string | undefined) {
    const p = new URLSearchParams();
    const cur: Record<string, string | undefined> = {
      search, type, employment, level, city, skill, salary: searchParams.salary,
    };
    cur[key] = val;
    for (const [k, v] of Object.entries(cur)) { if (v) p.set(k, v); }
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  /* Pagination URL — keeps every active filter. */
  function pageUrl(p: number) {
    const up = new URLSearchParams();
    if (search             ) up.set("search",     search);
    if (type               ) up.set("type",       type);
    if (employment         ) up.set("employment", employment);
    if (level              ) up.set("level",       level);
    if (city               ) up.set("city",        city);
    if (skill              ) up.set("skill",        skill);
    if (searchParams.salary) up.set("salary",   searchParams.salary);
    if (p > 1              ) up.set("page",         String(p));
    const qs = up.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  /* Active filter pills (category is fixed by the path, so it is not listed). */
  const activeFilters: { label: string; key: string }[] = [];
  if (search    ) activeFilters.push({ label: `"${search}"`,                               key: "search"     });
  if (type      ) activeFilters.push({ label: WORK_TYPE_LABELS[type] ?? type,              key: "type"       });
  if (employment) activeFilters.push({ label: EMPLOYMENT_LABELS[employment] ?? employment, key: "employment" });
  if (level     ) activeFilters.push({ label: EXPERIENCE_LABELS[level] ?? level,           key: "level"      });
  if (city      ) activeFilters.push({ label: city,                                        key: "city"       });
  if (skill     ) activeFilters.push({ label: skill,                                       key: "skill"      });
  if (salary    ) activeFilters.push({ label: `min €${(salary / 1000).toFixed(0)}k`,       key: "salary"     });

  /* Unique intro copy per category — name, real count, cities. Uses the whole
     category total (not the filtered count) so the SEO copy stays stable. */
  const intro = `Browse ${categoryTotal > 0 ? `${categoryTotal} ` : ""}${name} job${categoryTotal === 1 ? "" : "s"} in Cyprus. `
    + `Find ${name.toLowerCase()} roles at leading companies in Limassol, Nicosia, Larnaca and remote — with pay shown wherever the employer publishes it, updated daily.`;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home",     path: "" },
    { name: "All Jobs", path: "/jobs" },
    { name: `${name} Jobs`, path: `/jobs/category/${slug}` },
  ]);

  /* ItemList of the jobs on this page, so Google reads it as a jobs collection. */
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

  /* Category-specific FAQ — unique content per page (name + live count) plus
     FAQ schema, matching the depth of the city pages. */
  const faqs = [
    { question: `How many ${name} jobs are available in Cyprus?`,
      answer: `There ${categoryTotal === 1 ? "is" : "are"} currently ${categoryTotal} ${name} job${categoryTotal === 1 ? "" : "s"} in Cyprus on CyprusTech.Careers, updated daily. Roles span Limassol, Nicosia, Larnaca and remote, and pay is shown wherever the employer publishes it.` },
    { question: `What salary do ${name} roles in Cyprus pay?`,
      answer: `${name} salaries in Cyprus typically range from about €35,000 for junior positions to €120,000+ for senior and lead roles, with fintech and forex companies paying at the top of the range. Every listing on CyprusTech.Careers shows the salary up front.` },
    { question: `Which cities have the most ${name} jobs in Cyprus?`,
      answer: `Limassol leads for ${name.toLowerCase()} roles thanks to its fintech and forex cluster, followed by Nicosia's gaming and enterprise scene. Larnaca and Paphos are growing, and many roles are fully remote — use the city filter to narrow your search.` },
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
            <span style={{ color: "var(--text)" }}>{name}</span>
          </div>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            {total}{activeFilters.length ? " MATCHING" : ""} JOB{total === 1 ? "" : "S"} · UPDATED DAILY
          </div>
          <h1 className="display-m" style={{ marginBottom: 12 }}>
            {name} Jobs in Cyprus
          </h1>
          <p className="body" style={{ color: "var(--text-muted)", maxWidth: 620 }}>
            {intro}
          </p>
        </div>

        {/* Keyword search — carries the active filters so a search refines them */}
        <form action={basePath} method="GET" style={{ marginBottom: 28 }}>
          {type                && <input type="hidden" name="type"       value={type} />}
          {employment          && <input type="hidden" name="employment" value={employment} />}
          {level               && <input type="hidden" name="level"      value={level} />}
          {city                && <input type="hidden" name="city"       value={city} />}
          {skill               && <input type="hidden" name="skill"      value={skill} />}
          {searchParams.salary && <input type="hidden" name="salary"     value={searchParams.salary} />}
          <div style={{ position: "relative", maxWidth: 600 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <input
              className="input" type="text" name="search" defaultValue={search ?? ""}
              placeholder={`Search ${name} jobs…`}
              style={{ paddingLeft: 40, paddingBlock: 12, fontSize: 15 }}
            />
          </div>
        </form>

        {/* Sidebar + content grid */}
        <div className="layout-sidebar-left" style={{ alignItems: "start" }}>

          {/* ── Filter sidebar (category is fixed by the path) ── */}
          <FilterBar
            categories={[]}
            current={{ type, employment, city, level, skill, salary: searchParams.salary, search }}
            cities={CITIES}
            basePath={basePath}
            hideCategoryFilter
          />

          {/* ── Main content ── */}
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
                  {activeFilters.length ? `No ${name} jobs match your filters` : `No ${name} jobs open right now`}
                </div>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                  {activeFilters.length
                    ? "Try removing a filter, or browse the whole category."
                    : "We add new listings daily. Browse all open roles or set up a job alert."}
                </p>
                <Link href={activeFilters.length ? basePath : "/jobs"} className="btn btn-accent">
                  {activeFilters.length ? `View all ${name} jobs` : "Browse all jobs"}
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {serialisedJobs.map(job => <JobCard key={job.id} {...job} />)}
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

        {/* FAQ — content depth + FAQ schema above */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <h2 className="h3" style={{ marginBottom: 16 }}>{name} jobs in Cyprus — FAQ</h2>
          <div style={{ maxWidth: 720 }}>
            <FaqAccordion faqs={faqs.map(f => ({ q: f.question, a: f.answer }))} />
          </div>
        </div>

        {/* SEO internal links — browse this category by city */}
        <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 14 }}>{name.toUpperCase()} JOBS BY CITY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CITY_LINKS.map(c => (
              <Link key={c.slug} href={`/jobs/category/${slug}/${c.slug}`} className="chip">
                {c.slug === "remote" ? `Remote ${name}` : `${name} in ${c.displayName}`}
              </Link>
            ))}
          </div>
        </div>

        {/* SEO internal links — browse this category by job type */}
        <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 14 }}>{name.toUpperCase()} JOBS BY TYPE</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {JOB_TYPE_LINKS.map(t => (
              <Link key={t.slug} href={`/jobs/type/${t.slug}?category=${slug}`} className="chip">
                {t.displayName} {name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
