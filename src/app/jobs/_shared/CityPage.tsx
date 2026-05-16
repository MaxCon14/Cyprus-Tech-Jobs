import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getJobCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PAGE_SIZE = 20;
const BASE_URL  = "https://cyprustech.careers";

export interface CityConfig {
  /** Display name — "Nicosia", "Remote", etc. */
  displayName: string;
  /** URL slug — "nicosia", "remote", etc. */
  slug: string;
  /** Prisma city filter value. Undefined for Remote. */
  city?: string;
  /** True for the Remote page (filter by remoteType instead of city). */
  isRemote?: boolean;
  /** One-liner blurb shown in the page intro. */
  description: string;
}

interface Props {
  config: CityConfig;
  pageNum: number;
}

export async function CityPage({ config, pageNum }: Props) {
  const { displayName, slug, city, isRemote, description } = config;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const filters = isRemote
    ? { remoteType: "REMOTE" as const }
    : { city };

  let jobs:  Awaited<ReturnType<typeof getJobs>> = [];
  let total = 0;
  try {
    [jobs, total] = await Promise.all([
      getJobs({ ...filters, take: PAGE_SIZE, skip: (pageNum - 1) * PAGE_SIZE }),
      getJobCount(filters),
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

  function pageUrl(p: number) {
    return p === 1 ? `/jobs/${slug}` : `/jobs/${slug}?page=${p}`;
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
            <Link href="/"    style={{ color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/jobs" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Jobs</Link>
            <span>/</span>
            <span style={{ color: "var(--text)" }}>{displayName}</span>
          </div>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            {total} JOBS · UPDATED DAILY
          </div>
          <h1 className="display-m" style={{ marginBottom: 12 }}>
            Tech Jobs in {displayName}
          </h1>
          <p className="body" style={{ color: "var(--text-muted)", maxWidth: 560, marginBottom: 20 }}>
            {description}
          </p>
          <Link
            href={isRemote ? "/jobs?type=REMOTE" : `/jobs?city=${city ?? displayName}`}
            className="btn btn-outline btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Filter &amp; search these jobs →
          </Link>
        </div>

        {/* Results count */}
        {total > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span className="body-s" style={{ color: "var(--text-muted)" }}>
              Showing <strong style={{ color: "var(--text)" }}>{showFrom}–{showTo}</strong> of{" "}
              <strong style={{ color: "var(--text)" }}>{total}</strong> jobs
            </span>
          </div>
        )}

        {/* Job list */}
        {serialisedJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
              No jobs in {displayName} right now
            </div>
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              We&apos;re adding new listings daily. Browse all open roles or set up a job alert.
            </p>
            <Link href="/jobs" className="btn btn-accent">Browse all jobs</Link>
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
    </>
  );
}

const OTHER_CITIES: Pick<CityConfig, "displayName" | "slug">[] = [
  { displayName: "Nicosia",    slug: "nicosia"    },
  { displayName: "Limassol",   slug: "limassol"   },
  { displayName: "Larnaca",    slug: "larnaca"    },
  { displayName: "Paphos",     slug: "paphos"     },
  { displayName: "Famagusta",  slug: "famagusta"  },
  { displayName: "Remote",     slug: "remote"     },
];
