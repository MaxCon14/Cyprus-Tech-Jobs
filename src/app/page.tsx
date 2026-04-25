import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getCompanies, getCategoriesWithCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { Search, MapPin, Bell } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [jobs, companies, categories] = await Promise.all([
    getJobs({ take: 5 }),
    getCompanies({ featured: true }),
    getCategoriesWithCount(),
  ]);

  const serialisedJobs = jobs.map(serialiseJob);
  const totalJobs      = categories[0]?.count ?? 0;

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid var(--border)", padding: "80px 24px 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 24, height: 1, background: "var(--accent)", display: "inline-block" }} />
            CYPRUSTECHJOBS · THE HOME FOR TECH JOBS IN CYPRUS
          </div>

          <h1 className="display-xl" style={{ marginBottom: 16, maxWidth: 780 }}>
            Find your next tech role{" "}
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>in Cyprus.</em>
          </h1>

          <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 560, marginBottom: 40 }}>
            Curated tech jobs at the best companies in Limassol, Nicosia, Larnaca, and remote.
            Salaries included. No recruiter spam.
          </p>

          {/* Search */}
          <div style={{ display: "flex", gap: 8, maxWidth: 640, marginBottom: 40 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input className="input" type="text" placeholder="Job title, company, or keyword…" style={{ paddingLeft: 38 }} />
            </div>
            <div style={{ position: "relative", width: 180 }}>
              <MapPin size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", zIndex: 1 }} />
              <select className="select" style={{ paddingLeft: 38 }}>
                <option value="">All locations</option>
                <option value="limassol">Limassol</option>
                <option value="nicosia">Nicosia</option>
                <option value="larnaca">Larnaca</option>
                <option value="paphos">Paphos</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <Link href="/jobs" className="btn btn-accent">Search</Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              [String(totalJobs),   "active jobs"],
              [String(companies.length) + "+", "companies hiring"],
              ["€45K—€120K", "typical salary range"],
            ].map(([val, label]) => (
              <div key={label}>
                <div className="mono-l" style={{ color: "var(--accent)", display: "block", marginBottom: 2 }}>{val}</div>
                <div className="body-s" style={{ color: "var(--text-subtle)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANIES HIRING THIS WEEK ── */}
      <section style={{ borderBottom: "1px solid var(--border)", padding: "28px 24px", background: "var(--bg-alt)", overflowX: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: "max-content" }}>
            <span className="mono-s" style={{ color: "var(--text-subtle)", whiteSpace: "nowrap" }}>HIRING THIS WEEK</span>
            <span style={{ width: 1, height: 20, background: "var(--border-strong)", display: "inline-block" }} />
            {companies.map(co => (
              <Link
                key={co.slug}
                href={`/companies/${co.slug}`}
                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: "8px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", whiteSpace: "nowrap" }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--black)", color: "var(--white)", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {co.name.charAt(0)}
                </span>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{co.name}</div>
                  <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{co.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN ── */}
      <section style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }}>

            {/* Job listings */}
            <div>
              {/* Category filter chips */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {categories.map((cat, i) => (
                  <Link key={cat.slug} href={cat.slug ? `/jobs/${cat.slug}` : "/jobs"} className={`chip${i === 0 ? " chip-active" : ""}`}>
                    {cat.label} <span className="chip-count">{cat.count}</span>
                  </Link>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 className="h2">Latest jobs</h2>
                <Link href="/jobs" className="mono-s" style={{ color: "var(--text-subtle)", textDecoration: "none" }}>VIEW ALL →</Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {serialisedJobs.map(job => <JobCard key={job.id} {...job} />)}
              </div>

              <div style={{ marginTop: 24 }}>
                <Link href="/jobs" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                  View all {totalJobs} jobs →
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 80 }}>

              {/* Job alerts */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Bell size={16} style={{ color: "var(--accent)" }} />
                  <h3 className="h3">Job alerts</h3>
                </div>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                  Get new Cyprus tech jobs in your inbox. Free, no account needed.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input className="input" type="email" placeholder="your@email.com" />
                  <select className="select">
                    <option value="">All categories</option>
                    {categories.slice(1).map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                    ))}
                  </select>
                  <button className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>Get alerts</button>
                </div>
                <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 10 }}>UNSUBSCRIBE ANYTIME · NO SPAM</p>
              </div>

              {/* Hiring CTA */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
                <h3 className="h3" style={{ marginBottom: 8 }}>Hiring in Cyprus?</h3>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                  Reach thousands of tech professionals actively looking for roles in Cyprus.
                </p>
                <Link href="/post-a-job" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Post a job →</Link>
              </div>

              {/* Market snapshot */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
                <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16 }}>MARKET SNAPSHOT</div>
                {[
                  ["Most in demand", "Frontend, Backend"],
                  ["Top location",   "Limassol (68%)"],
                  ["Avg. senior salary", "€75,000"],
                  ["Remote roles",   "34%"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span className="body-s" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="mono-s" style={{ color: "var(--text)" }}>{value}</span>
                  </div>
                ))}
                <Link href="/salary-guide" className="mono-s" style={{ color: "var(--accent)", textDecoration: "none", display: "block", marginTop: 14 }}>
                  FULL SALARY GUIDE →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
