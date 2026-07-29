import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getJobCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { buildBreadcrumbSchema, jsonLd } from "@/lib/schema";

const PAGE_SIZE = 20;
const BASE_URL  = "https://cyprustech.careers";

const CITIES = [
  { displayName: "Limassol", slug: "limassol" },
  { displayName: "Nicosia",  slug: "nicosia"  },
  { displayName: "Larnaca",  slug: "larnaca"  },
  { displayName: "Paphos",   slug: "paphos"   },
  { displayName: "Remote",   slug: "remote"   },
];

export interface CategoryNode {
  name: string;
  slug: string;
  parent: { name: string; slug: string } | null;
  children: { name: string; slug: string }[];
}

interface Props {
  category:     CategoryNode;
  searchParams: { page?: string; search?: string };
}

export async function CategoryPage({ category, searchParams }: Props) {
  const { name, slug, parent, children } = category;

  const search  = searchParams.search?.trim() || undefined;
  const pageNum = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const basePath = `/jobs/category/${slug}`;

  const filters = { categorySlug: slug, search };

  let jobs:  Awaited<ReturnType<typeof getJobs>> = [];
  let total = 0;
  try {
    [jobs, total] = await Promise.all([
      getJobs({ ...filters, take: PAGE_SIZE, skip: (pageNum - 1) * PAGE_SIZE }),
      getJobCount(filters),
    ]);
  } catch (err) { console.error(`[category-jobs/${slug}] DB error:`, err); }

  const serialisedJobs = jobs.map(serialiseJob);
  const showFrom = total === 0 ? 0 : (pageNum - 1) * PAGE_SIZE + 1;
  const showTo   = Math.min(pageNum * PAGE_SIZE, total);
  const hasPrev  = pageNum > 1;
  const hasNext  = pageNum * PAGE_SIZE < total;

  function pageUrl(p: number) {
    const up = new URLSearchParams();
    if (search) up.set("search", search);
    if (p > 1 ) up.set("page", String(p));
    const qs = up.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  /* Unique intro copy per category — name, real count, cities, and the roles
     it covers. Templated but substantive, so each page is not thin. */
  const intro = `Browse ${total > 0 ? `${total} ` : ""}${name} job${total === 1 ? "" : "s"} in Cyprus. `
    + `Find ${name.toLowerCase()} roles at leading companies in Limassol, Nicosia, Larnaca and remote — every listing with a verified salary, updated daily.`;

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />
      )}

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
            {total} JOB{total === 1 ? "" : "S"} · UPDATED DAILY
          </div>
          <h1 className="display-m" style={{ marginBottom: 12 }}>
            {name} Jobs in Cyprus
          </h1>
          <p className="body" style={{ color: "var(--text-muted)", maxWidth: 620 }}>
            {intro}
          </p>

          {/* Related roles / parent — unique content + internal links */}
          {(children.length > 0 || parent) && (
            <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span className="mono-s" style={{ color: "var(--text-subtle)" }}>
                {children.length > 0 ? "ROLES:" : "PART OF:"}
              </span>
              {parent && (
                <Link href={`/jobs/category/${parent.slug}`} className="chip">{parent.name}</Link>
              )}
              {children.map(c => (
                <Link key={c.slug} href={`/jobs/category/${c.slug}`} className="chip">{c.name}</Link>
              ))}
            </div>
          )}
        </div>

        {/* Keyword search */}
        <form action={basePath} method="GET" style={{ marginBottom: 24 }}>
          <div style={{ position: "relative", maxWidth: 600 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <input
              className="input" type="text" name="search" defaultValue={search ?? ""}
              placeholder={`Search ${name} jobs…`}
              style={{ paddingLeft: 40, paddingBlock: 12, fontSize: 15 }}
            />
          </div>
        </form>

        {/* Results count */}
        <div style={{ marginBottom: 16 }}>
          <span className="body-s" style={{ color: "var(--text-muted)" }}>
            {total === 0
              ? "No jobs found"
              : <>Showing <strong style={{ color: "var(--text)" }}>{showFrom}–{showTo}</strong> of <strong style={{ color: "var(--text)" }}>{total}</strong> jobs</>
            }
          </span>
        </div>

        {/* Job list */}
        {serialisedJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
              No {name} jobs open right now
            </div>
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              We add new listings daily. Browse all open roles or set up a job alert.
            </p>
            <Link href="/jobs" className="btn btn-accent">Browse all jobs</Link>
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

        {/* SEO internal links — browse this category by city */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
          <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 14 }}>{name.toUpperCase()} JOBS BY CITY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CITIES.map(c => (
              <Link key={c.slug} href={`/jobs/${c.slug}?category=${slug}`} className="chip">
                {name} in {c.displayName}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
