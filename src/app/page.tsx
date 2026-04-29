import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getCompanies, getCategoriesWithCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { Search, MapPin, Bell, UserPlus, Zap, Target } from "lucide-react";
import { FaqAccordion } from "@/components/home/FaqAccordion";
export const dynamic = "force-dynamic";

/* ── FAQ data ── */
const FAQS = [
  {
    q: "What tech jobs are available in Cyprus?",
    a: "Cyprus has a thriving tech scene with hundreds of open roles across software engineering, frontend and backend development, DevOps, UI/UX design, data engineering, product management, cybersecurity, and QA. Sectors include fintech (Revolut, eToro, XM Group), gaming (Wargaming), and a growing startup ecosystem. CyprusTech.Careers lists all active roles with verified salaries.",
  },
  {
    q: "What is the average salary for software engineers in Cyprus?",
    a: "Software engineers in Cyprus earn between €35,000–€120,000 annually depending on level and specialisation. Junior developers typically earn €30,000–€50,000, mid-level engineers €50,000–€80,000, and senior engineers €75,000–€120,000+. Limassol commands the highest salaries, particularly at fintech companies. All salaries on this platform are verified and shown upfront.",
  },
  {
    q: "Which cities in Cyprus have the most tech jobs?",
    a: "Limassol is the tech capital of Cyprus, home to major fintech companies like Revolut, eToro, and Exness — accounting for around 68% of all tech roles. Nicosia has a strong gaming cluster, notably Wargaming. Larnaca and Paphos have smaller but growing tech scenes. Many companies also offer fully remote roles open to candidates anywhere in Cyprus.",
  },
  {
    q: "Can foreigners work in tech in Cyprus?",
    a: "Yes. Cyprus is an EU member state, so EU/EEA citizens can work freely without a work permit. Non-EU nationals can apply for a fast-track residency and work permit — the process typically takes 2–3 months. Major tech employers regularly sponsor international hires and often include relocation packages covering flights and initial accommodation.",
  },
  {
    q: "What are the top tech companies hiring in Cyprus?",
    a: "The largest tech employers in Cyprus include Revolut (fintech, Limassol), Wargaming (gaming, Nicosia), eToro (fintech, Limassol), XM Group (trading, Limassol), Exness (fintech, Limassol), and Cablenet. The island also has a fast-growing startup scene with venture-backed companies across SaaS, payments, and crypto.",
  },
  {
    q: "Do Cyprus tech companies offer remote work?",
    a: "Around 34% of tech roles in Cyprus offer remote or hybrid working. Fully remote roles are most common at product and SaaS companies, while fintech and gaming firms typically prefer on-site or hybrid arrangements. You can filter jobs by Remote, Hybrid, or On-site on our jobs page.",
  },
  {
    q: "How do I find a software developer job in Cyprus?",
    a: "Create a free candidate profile on CyprusTech.Careers, set your preferred categories and salary range, and receive daily or weekly alerts for matching roles. Our listings always include salaries — so there are no surprises. You can also browse by category (Frontend, Backend, DevOps, etc.) or filter by city to narrow your search.",
  },
  {
    q: "What is the cost of living in Cyprus compared to salaries?",
    a: "Cyprus offers a strong quality of life relative to tech salaries. Rent for a modern 2-bedroom apartment in Limassol ranges from €1,200–€2,000/month. Groceries and dining are moderately priced. Combined with a flat 35% income tax rate above €60K and the non-domicile tax regime for new residents, many international tech workers find Cyprus very financially attractive.",
  },
];

/* ── Category icons (emoji-free, SVG-based categories list) ── */
const CATEGORY_GRID = [
  { label: "Frontend",          slug: "frontend",  icon: "⌨️",  count: 62 },
  { label: "Backend",           slug: "backend",   icon: "⚙️",  count: 48 },
  { label: "DevOps & Cloud",    slug: "devops",    icon: "☁️",  count: 24 },
  { label: "UI/UX Design",      slug: "design",    icon: "🎨",  count: 18 },
  { label: "Data & Analytics",  slug: "data",      icon: "📊",  count: 15 },
  { label: "Mobile",            slug: "mobile",    icon: "📱",  count: 11 },
  { label: "Product",           slug: "product",   icon: "🗂️",  count: 9  },
  { label: "Security",          slug: "security",  icon: "🔐",  count: 7  },
];

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
      <section style={{ borderBottom: "1px solid var(--border)", padding: "clamp(48px, 8vw, 80px) 0 clamp(40px, 6vw, 64px)" }}>
        <div className="page-container">
          <div className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 24, height: 1, background: "var(--accent)", display: "inline-block" }} />
            CYPRUSTECHCAREERS · THE HOME FOR TECH JOBS IN CYPRUS
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
          <div style={{ display: "flex", gap: 8, maxWidth: 640, marginBottom: 40, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input className="input" type="text" placeholder="Job title, company, or keyword…" style={{ paddingLeft: 38 }} />
            </div>
            <div style={{ position: "relative", flex: "0 0 160px" }}>
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
              [String(totalJobs),               "active jobs"],
              [String(companies.length) + "+",  "companies hiring"],
              ["€45K—€120K",                    "typical salary range"],
            ].map(([val, label]) => (
              <div key={label}>
                <div className="mono-l" style={{ color: "var(--accent)", display: "block", marginBottom: 2 }}>{val}</div>
                <div className="body-s" style={{ color: "var(--text-subtle)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANIES TICKER ── */}
      <section style={{ borderBottom: "1px solid var(--border)", padding: "28px 0", background: "var(--bg-alt)", overflowX: "auto" }}>
        <div className="page-container">
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

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "clamp(32px, 5vw, 48px)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 className="display-m" style={{ marginBottom: 12 }}>Your next Cyprus role in 3 steps</h2>
            <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 480, margin: "0 auto" }}>
              No middlemen, no recruiter calls. Just you, the role, and a direct apply link.
            </p>
          </div>
          <div className="grid-3" style={{ gap: "clamp(16px, 3vw, 28px)" }}>
            {[
              {
                icon: <UserPlus size={22} style={{ color: "var(--accent)" }} />,
                step: "01",
                title: "Create your free profile",
                desc: "Set your skills, salary expectations, and preferred work type. Takes under 5 minutes.",
              },
              {
                icon: <Bell size={22} style={{ color: "var(--accent)" }} />,
                step: "02",
                title: "Get matched roles in your inbox",
                desc: "Receive daily or weekly alerts for jobs that match your profile. Salaries always included.",
              },
              {
                icon: <Zap size={22} style={{ color: "var(--accent)" }} />,
                step: "03",
                title: "Apply directly",
                desc: "Every listing links straight to the company's application page — no middleman, no CV black hole.",
              },
            ].map(item => (
              <div key={item.step} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "clamp(20px, 3vw, 28px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{item.step}</span>
                </div>
                <h3 className="h3" style={{ marginBottom: 8 }}>{item.title}</h3>
                <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN: Jobs + Sidebar ── */}
      <section style={{ padding: "clamp(32px, 5vw, 48px) 0" }}>
        <div className="page-container">
          <div className="layout-sidebar-sm">

            {/* Job listings */}
            <div>
              {/* Category filter chips */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {categories.map((cat, i) => (
                  <Link key={cat.slug} href={cat.slug ? `/jobs?category=${cat.slug}` : "/jobs"} className={`chip${i === 0 ? " chip-active" : ""}`}>
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

      {/* ── BROWSE BY CATEGORY ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
        <div className="page-container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "clamp(24px, 4vw, 36px)", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8 }}>BROWSE BY CATEGORY</div>
              <h2 className="display-m">Find roles in your speciality</h2>
            </div>
            <Link href="/jobs" className="btn btn-outline btn-sm">All jobs →</Link>
          </div>
          <div className="grid-4" style={{ gap: "clamp(10px, 2vw, 16px)" }}>
            {CATEGORY_GRID.map(cat => (
              <Link
                key={cat.slug}
                href={`/jobs?category=${cat.slug}`}
                style={{ textDecoration: "none", display: "block", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "clamp(16px, 2.5vw, 22px)", transition: "all 180ms var(--ease-out)", cursor: "pointer" }}
                className="category-card"
              >
                <div style={{ fontSize: 26, marginBottom: 12, lineHeight: 1 }}>{cat.icon}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{cat.label}</div>
                <div className="mono-s" style={{ color: "var(--accent)" }}>{cat.count} open roles</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CANDIDATE CTA ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", borderBottom: "1px solid var(--border)" }}>
        <div className="page-container">
          <div style={{
            background: "var(--black)", borderRadius: 20, padding: "clamp(32px, 5vw, 56px) clamp(24px, 5vw, 56px)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32,
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative glow */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "var(--accent)", opacity: 0.12, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -80, left: 80, width: 200, height: 200, borderRadius: "50%", background: "var(--accent)", opacity: 0.07, pointerEvents: "none" }} />

            <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
              <div className="caption" style={{ color: "var(--accent)", marginBottom: 12 }}>FOR JOB SEEKERS</div>
              <h2 className="display-m" style={{ color: "var(--white)", marginBottom: 16, lineHeight: 1.15 }}>
                Build your profile.<br />Let the right jobs find you.
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Upload your CV and get AI-powered match scores",
                  "Personalised job alerts — daily or weekly",
                  "Save your preferences, salary expectations, and work type",
                  "Free forever for candidates",
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                      <Target size={9} style={{ color: "var(--white)" }} />
                    </div>
                    <span className="body-s" style={{ color: "var(--neutral-300)", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", flexShrink: 0 }}>
              <Link href="/get-started" className="btn btn-accent btn-lg" style={{ whiteSpace: "nowrap", justifyContent: "center" }}>
                Create free candidate account →
              </Link>
              <Link href="/jobs" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--neutral-400)", textDecoration: "none", textAlign: "center" }}>
                Browse jobs without an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
        <div className="page-container">
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "clamp(28px, 4vw, 44px)" }}>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>FAQ</div>
              <h2 className="display-m" style={{ marginBottom: 12 }}>Common questions about Cyprus tech jobs</h2>
              <p className="body" style={{ color: "var(--text-muted)" }}>
                Everything you need to know before starting your search.
              </p>
            </div>

            <FaqAccordion faqs={FAQS} />
          </div>
        </div>
      </section>

      {/* ── EMPLOYER CTA ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0" }}>
        <div className="page-container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, padding: "clamp(28px, 5vw, 48px)", border: "1px solid var(--border)", borderRadius: 16, background: "var(--surface)" }}>
            <div>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>FOR EMPLOYERS</div>
              <h2 className="h1" style={{ marginBottom: 8 }}>Hiring tech talent in Cyprus?</h2>
              <p className="body" style={{ color: "var(--text-muted)", maxWidth: 480 }}>
                Post a job and reach thousands of vetted candidates actively looking for roles in Cyprus.
                Listings go live in under 30 minutes.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/post-a-job" className="btn btn-accent btn-lg">Post a job →</Link>
              <Link href="/companies" className="btn btn-outline btn-lg">View companies</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
