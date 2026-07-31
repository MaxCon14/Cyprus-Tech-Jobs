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
import type { CategoryNode } from "./CategoryPage";

const PAGE_SIZE = 20;
const BASE_URL  = "https://cyprustech.careers";

/* The five location facets a role can be crossed with. `isRemote` swaps the
   physical-city filter for a remoteType=REMOTE base. Kept in sync with the
   CITY_CONFIG in the route and the CITY_LINKS on the category page. */
export interface FixedCity {
  slug: string;      // "limassol"
  name: string;      // "Limassol"
  isRemote?: boolean;
}

export const ROLE_CITIES: FixedCity[] = [
  { slug: "limassol", name: "Limassol" },
  { slug: "nicosia",  name: "Nicosia"  },
  { slug: "larnaca",  name: "Larnaca"  },
  { slug: "paphos",   name: "Paphos"   },
  { slug: "remote",   name: "Remote", isRemote: true },
];

interface Props {
  category: CategoryNode;
  city:     FixedCity;
  searchParams: {
    page?:       string;
    search?:     string;
    type?:       string;
    employment?: string;
    level?:      string;
    salary?:     string;
    skill?:      string;
  };
}

export async function CategoryCityPage({ category, city, searchParams }: Props) {
  const { name, slug } = category;
  const { name: cityName, slug: citySlug, isRemote } = city;

  const search     = searchParams.search?.trim() || undefined;
  // On the remote page the base is already REMOTE, so the work-type filter is
  // suppressed (and ignored here); on physical-city pages it still applies.
  const type       = !isRemote ? (searchParams.type || undefined) : undefined;
  const employment = searchParams.employment || undefined;
  const level      = searchParams.level      || undefined;
  const skill      = searchParams.skill      || undefined;
  const salary     = searchParams.salary ? parseInt(searchParams.salary) : undefined;
  const pageNum    = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const basePath   = `/jobs/category/${slug}/${citySlug}`;

  // The path fixes both the category and the location; the rest are user filters.
  const filters = {
    categorySlug:    slug,
    ...(isRemote ? { remoteType: "REMOTE" as const } : { city: cityName }),
    ...(!isRemote && type ? { remoteType: type } : {}),
    employmentType:  employment,
    experienceLevel: level,
    skill,
    salary,
    search,
  };

  // The location base without the user filters — drives the stable SEO copy.
  const baseFilter = {
    categorySlug: slug,
    ...(isRemote ? { remoteType: "REMOTE" as const } : { city: cityName }),
  };

  let jobs: Awaited<ReturnType<typeof getJobs>> = [];
  let total = 0;         // matches active filters — drives results + pagination
  let comboTotal = 0;    // whole role×city, unfiltered — drives the SEO copy
  try {
    [jobs, total, comboTotal] = await Promise.all([
      getJobs({ ...filters, take: PAGE_SIZE, skip: (pageNum - 1) * PAGE_SIZE }),
      getJobCount(filters),
      getJobCount(baseFilter),
    ]);
  } catch (err) { console.error(`[category-city/${slug}/${citySlug}] DB error:`, err); }

  const serialisedJobs = jobs.map(serialiseJob);
  const showFrom = total === 0 ? 0 : (pageNum - 1) * PAGE_SIZE + 1;
  const showTo   = Math.min(pageNum * PAGE_SIZE, total);
  const hasPrev  = pageNum > 1;
  const hasNext  = pageNum * PAGE_SIZE < total;

  const heading   = isRemote ? `Remote ${name} Jobs in Cyprus` : `${name} Jobs in ${cityName}`;
  const locPhrase = isRemote ? "remote across Cyprus" : `in ${cityName}`;

  /* URL builder — removes one filter param, keeping the rest. */
  function urlWith(key: string, val: string | undefined) {
    const p = new URLSearchParams();
    const cur: Record<string, string | undefined> = {
      search, type, employment, level, skill, salary: searchParams.salary,
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
    if (level              ) up.set("level",      level);
    if (skill              ) up.set("skill",      skill);
    if (searchParams.salary) up.set("salary",     searchParams.salary);
    if (p > 1              ) up.set("page",        String(p));
    const qs = up.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  /* Active filter pills (category + location are fixed by the path). */
  const activeFilters: { label: string; key: string }[] = [];
  if (search    ) activeFilters.push({ label: `"${search}"`,                               key: "search"     });
  if (type      ) activeFilters.push({ label: WORK_TYPE_LABELS[type] ?? type,              key: "type"       });
  if (employment) activeFilters.push({ label: EMPLOYMENT_LABELS[employment] ?? employment, key: "employment" });
  if (level     ) activeFilters.push({ label: EXPERIENCE_LABELS[level] ?? level,           key: "level"      });
  if (skill     ) activeFilters.push({ label: skill,                                       key: "skill"      });
  if (salary    ) activeFilters.push({ label: `min €${(salary / 1000).toFixed(0)}k`,       key: "salary"     });

  const intro = isRemote
    ? `Browse ${comboTotal > 0 ? `${comboTotal} ` : ""}remote ${name.toLowerCase()} job${comboTotal === 1 ? "" : "s"} in Cyprus. `
      + `Find ${name.toLowerCase()} roles you can do from anywhere in Cyprus — every listing with a verified salary, updated daily.`
    : `Browse ${comboTotal > 0 ? `${comboTotal} ` : ""}${name} job${comboTotal === 1 ? "" : "s"} in ${cityName}, Cyprus. `
      + `Find ${name.toLowerCase()} roles at leading ${cityName} companies — every listing with a verified salary, updated daily.`;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home",         path: "" },
    { name: "All Jobs",     path: "/jobs" },
    { name: `${name} Jobs`, path: `/jobs/category/${slug}` },
    { name: isRemote ? "Remote" : cityName, path: `/jobs/category/${slug}/${citySlug}` },
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

  /* Role×city FAQ — unique content per page (name + city + live count) + schema. */
  const faqs = isRemote
    ? [
        { question: `How many remote ${name} jobs are available in Cyprus?`,
          answer: `There ${comboTotal === 1 ? "is" : "are"} currently ${comboTotal} remote ${name} job${comboTotal === 1 ? "" : "s"} in Cyprus on CyprusTech.Careers, updated daily. Every listing shows a verified salary and can be done from anywhere in Cyprus.` },
        { question: `What do remote ${name} roles in Cyprus pay?`,
          answer: `Remote ${name} salaries in Cyprus typically range from about €35,000 for junior positions to €120,000+ for senior and lead roles, with fintech and forex companies paying at the top. Every listing on CyprusTech.Careers shows the salary up front.` },
        { question: `Do I need to live in Cyprus for these remote ${name} jobs?`,
          answer: `Most remote roles are open to candidates based anywhere in Cyprus, and many employers hire across the EU. Check each listing for its location requirements — they are stated on the job page.` },
      ]
    : [
        { question: `How many ${name} jobs are available in ${cityName}?`,
          answer: `There ${comboTotal === 1 ? "is" : "are"} currently ${comboTotal} ${name} job${comboTotal === 1 ? "" : "s"} in ${cityName} on CyprusTech.Careers, updated daily. Every listing shows a verified salary.` },
        { question: `What salary do ${name} roles in ${cityName} pay?`,
          answer: `${name} salaries in ${cityName} typically range from about €35,000 for junior positions to €120,000+ for senior and lead roles${cityName === "Limassol" ? ", with the city's fintech and forex cluster paying at the top of the range" : ""}. Every listing on CyprusTech.Careers shows the salary up front.` },
        { question: `Are there remote ${name} jobs as well as ${cityName}-based ones?`,
          answer: `Yes — alongside ${cityName}-based roles, many companies offer remote or hybrid ${name.toLowerCase()} positions. Browse the remote ${name.toLowerCase()} jobs page to see roles you can do from anywhere in Cyprus.` },
      ];
  const faqSchema = buildFAQSchema(faqs);

  /* Same role in the other locations — the core cross-link for this feature. */
  const otherCities = ROLE_CITIES.filter(c => c.slug !== citySlug);

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
            <Link href={`/jobs/category/${slug}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{name}</Link>
            <span>/</span>
            <span style={{ color: "var(--text)" }}>{isRemote ? "Remote" : cityName}</span>
          </div>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            {total}{activeFilters.length ? " MATCHING" : ""} JOB{total === 1 ? "" : "S"} · UPDATED DAILY
          </div>
          <h1 className="display-m" style={{ marginBottom: 12 }}>
            {heading}
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
          {skill               && <input type="hidden" name="skill"      value={skill} />}
          {searchParams.salary && <input type="hidden" name="salary"     value={searchParams.salary} />}
          <div style={{ position: "relative", maxWidth: 600 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <input
              className="input" type="text" name="search" defaultValue={search ?? ""}
              placeholder={`Search ${name} jobs ${locPhrase}…`}
              style={{ paddingLeft: 40, paddingBlock: 12, fontSize: 15 }}
            />
          </div>
        </form>

        {/* Sidebar + content grid */}
        <div className="layout-sidebar-left" style={{ alignItems: "start" }}>

          {/* ── Filter sidebar (category + city fixed by the path) ── */}
          <FilterBar
            categories={[]}
            current={{ type, employment, level, skill, salary: searchParams.salary, search }}
            cities={CITIES}
            basePath={basePath}
            hideCategoryFilter
            hideCityFilter
            hideTypeFilter={isRemote}
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
                  {activeFilters.length ? `No ${name} jobs match your filters` : `No ${name} jobs ${locPhrase} right now`}
                </div>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                  {activeFilters.length
                    ? "Try removing a filter, or browse the whole category."
                    : `We add new listings daily. Browse all ${name} jobs across Cyprus or set up a job alert.`}
                </p>
                <Link href={activeFilters.length ? basePath : `/jobs/category/${slug}`} className="btn btn-accent">
                  {activeFilters.length ? `View all ${name} jobs ${locPhrase}` : `All ${name} jobs in Cyprus`}
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
          <h2 className="h3" style={{ marginBottom: 16 }}>{heading} — FAQ</h2>
          <div style={{ maxWidth: 720 }}>
            <FaqAccordion faqs={faqs.map(f => ({ q: f.question, a: f.answer }))} />
          </div>
        </div>

        {/* SEO internal links — the same role in other locations */}
        <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 14 }}>{name.toUpperCase()} JOBS ELSEWHERE IN CYPRUS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link href={`/jobs/category/${slug}`} className="chip">All {name} jobs in Cyprus</Link>
            {otherCities.map(c => (
              <Link key={c.slug} href={`/jobs/category/${slug}/${c.slug}`} className="chip">
                {c.isRemote ? `Remote ${name}` : `${name} in ${c.name}`}
              </Link>
            ))}
          </div>
        </div>

        {/* SEO internal links — related roles in this same location. Uses the
            category's own parent/children so the links are always real
            role×city pages, plus a link back to every job in the location. */}
        <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 14 }}>
            {isRemote ? "MORE REMOTE ROLES" : `RELATED ROLES IN ${cityName.toUpperCase()}`}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {!isRemote && (
              <Link href={`/jobs/${citySlug}`} className="chip">All tech jobs in {cityName}</Link>
            )}
            {category.parent && (
              <Link href={`/jobs/category/${category.parent.slug}/${citySlug}`} className="chip">
                {isRemote ? `Remote ${category.parent.name}` : `${category.parent.name} in ${cityName}`}
              </Link>
            )}
            {category.children.slice(0, 6).map(child => (
              <Link key={child.slug} href={`/jobs/category/${child.slug}/${citySlug}`} className="chip">
                {isRemote ? `Remote ${child.name}` : `${child.name} in ${cityName}`}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
