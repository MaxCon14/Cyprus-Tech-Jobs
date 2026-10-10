import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";
import { getJobs, getCategoriesWithCount } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import {
  Search, MapPin, Bell, UserPlus, Zap,
  Code2, Server, Cloud, PenTool, BarChart2, Smartphone, Layers, ShieldCheck,
  Blocks, CandlestickChart, UsersRound, TestTube2, Briefcase,
  Headphones, ShieldAlert, Gauge, Scale, Calculator, Users, Megaphone, TrendingUp, Workflow,
  MonitorCog, Gamepad2,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { buildWebSiteSchema, buildFAQSchema, jsonLd } from "@/lib/schema";
import { JobAlertForm } from "@/components/alerts/JobAlertForm";
import type { Metadata } from "next";
export const revalidate = 300;

export const metadata: Metadata = {
  // Keyword-first, with the brand written in explicitly. Next.js does NOT run
  // the root layout's `title.template` over this page: the index page shares the
  // root layout's own segment, and a template only decorates *child* segments.
  // (Verified live: /jobs gets the "| CyprusTech.Careers" suffix, the homepage
  // does not.) So unlike every child page, the brand has to be added here.
  title: "Tech & IT Jobs in Cyprus | CyprusTech.Careers",
  description: "Find tech jobs in Cyprus, with pay shown wherever the employer publishes it. Browse IT, software, DevOps, design, data and product roles in Limassol, Nicosia, Larnaca and remote — everything you need to work in Cyprus tech.",
  alternates: { canonical: "https://cyprustech.careers" },
  openGraph: {
    // OpenGraph/Twitter titles don't go through the layout template, so they
    // carry the brand explicitly.
    title: "Tech & IT Jobs in Cyprus | CyprusTech.Careers",
    description: "Find tech jobs in Cyprus, with pay shown wherever the employer publishes it. IT, software, DevOps, design, data and product roles in Limassol, Nicosia, Larnaca and remote.",
    url: "https://cyprustech.careers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech & IT Jobs in Cyprus | CyprusTech.Careers",
    description: "Find tech jobs in Cyprus — IT, software, DevOps, design, data and product roles, with pay shown wherever the employer publishes it.",
  },
};

/* ── FAQ data ── */
const FAQS = [
  {
    "q": "What tech jobs can I find in Cyprus?",
    "a": "Browse curated roles in software engineering, IT, design, data, DevOps, product and related fields. Use the job category and location filters to see current vacancies."
  },
  {
    "q": "Are salaries included in every job listing?",
    "a": "Salary information appears when the employer has disclosed it. Listings without a published range are marked undisclosed; we do not estimate an employer's offer."
  },
  {
    "q": "How can I find jobs in Limassol, Nicosia or Larnaca?",
    "a": "Choose a city in the search filters or browse the city pages linked below. You can also filter by job category, experience level and employment type."
  },
  {
    "q": "Can I find remote tech jobs in Cyprus?",
    "a": "Use the Remote filter for roles listed as fully remote and Hybrid for roles that combine office and remote work. Check each employer's location and eligibility requirements before applying."
  },
  {
    "q": "How do I apply for a curated job?",
    "a": "Open the listing and follow its application instructions. Curated listings usually take you to the employer's careers site or application provider, where the employer handles your application."
  },
  {
    "q": "Do I need an account to browse jobs?",
    "a": "You can browse jobs and follow external application links without an account. A free candidate account lets you save preferences and use candidate features."
  },
  {
    "q": "Who publishes the listings?",
    "a": "CyprusTech.Careers currently curates technology vacancies from employer sources. A curated listing does not imply that the employer is a platform partner."
  },
  {
    "q": "Can employers post their own vacancies?",
    "a": "Employers can create an account and use the Post a Job page to publish and manage vacancies. Public company profiles have not launched yet."
  }
];

/* ── Category icons (line icons, not emoji — emoji render as the OS's own
   colourful glyphs, which clash with the rest of the UI).

   Keyed by slug rather than being a list of its own: the grid itself is built
   from the categories in the database, so adding one in /admin/taxonomy puts it
   on the homepage with a generic icon instead of leaving it unreachable. ── */
const CATEGORY_ICONS: Record<string, typeof Code2> = {
  frontend:     Code2,
  backend:      Server,
  devops:       Cloud,
  design:       PenTool,
  data:         BarChart2,
  mobile:       Smartphone,
  product:      Layers,
  security:     ShieldCheck,
  "full-stack": Blocks,
  finance:      CandlestickChart,
  management:   UsersRound,
  qa:           TestTube2,
  "customer-support": Headphones,
  compliance:   ShieldAlert,
  risk:         Gauge,
  legal:        Scale,
  accounting:   Calculator,
  hr:           Users,
  marketing:    Megaphone,
  sales:        TrendingUp,
  operations:   Workflow,
  it:           MonitorCog,
  gaming:       Gamepad2,
};

export default async function HomePage() {
  let jobs: Awaited<ReturnType<typeof getJobs>> = [];
  let categories: Awaited<ReturnType<typeof getCategoriesWithCount>> = [];

  try {
    [jobs, categories] = await Promise.all([
      getJobs({ take: 5 }),
      getCategoriesWithCount(),
    ]);
  } catch (err) { console.error("[home] DB error:", err); }

  const serialisedJobs = jobs.map(serialiseJob);
  const totalJobs      = categories[0]?.count ?? 0;

  // Real active-job count per category slug (parents + children), so the
  // "Browse by category" grid shows true numbers instead of placeholders.
  const countBySlug = new Map<string, number>();
  for (const c of categories) {
    if (c.slug) countBySlug.set(c.slug, c.count);
    for (const child of c.children) countBySlug.set(child.slug, child.count);
  }

  // The "Browse by category" grid — every top-level category, in the same order
  // and under the same names as the nav and the /jobs filter panel.
  // categories[0] is the synthetic "All jobs" row, which is not a category.
  const categoryGrid = categories.slice(1).filter(c => c.count > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildWebSiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildFAQSchema(FAQS.map(f => ({ question: f.q, answer: f.a })))) }}
      />
      {/* ── HERO ── */}
      <section style={{ borderBottom: "1px solid var(--border)", padding: "clamp(48px, 8vw, 80px) 0 clamp(40px, 6vw, 64px)" }}>
        <div className="page-container">
          <div className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 24, height: 1, background: "var(--accent)", display: "inline-block" }} />
            CYPRUSTECHCAREERS · THE HOME FOR TECH JOBS IN CYPRUS
          </div>

          <h1 className="display-xl" style={{ marginBottom: 16, maxWidth: 780 }}>
            Find your next tech job{" "}
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>in Cyprus.</em>
          </h1>

          <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 560, marginBottom: 40 }}>
            Curated tech jobs at the best companies in Limassol, Nicosia, Larnaca, and remote.
            Pay shown when employers disclose it. Apply directly to the roles that fit.
          </p>

          {/* Search */}
          <form action="/jobs" method="GET" className="hero-search" style={{ maxWidth: 640, marginBottom: 40 }}>
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input className="input" type="text" name="search" aria-label="Search jobs by title, company, or keyword" placeholder="Job title, company, or keyword…" style={{ paddingLeft: 38 }} />
            </div>
            <div style={{ flex: "0 0 170px" }}>
              <Select
                name="city"
                placeholder="All locations"
                icon={<MapPin size={14} />}
                options={[
                  { label: "All locations", value: "" },
                  { label: "Limassol",      value: "Limassol" },
                  { label: "Nicosia",       value: "Nicosia" },
                  { label: "Larnaca",       value: "Larnaca" },
                  { label: "Paphos",        value: "Paphos" },
                ]}
              />
            </div>
            <button type="submit" className="btn btn-accent">Search</button>
          </form>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              [String(totalJobs),               "active jobs"],
              ["Curated",                       "technology roles"],
              ["Free",                          "for job seekers"],
            ].map(([val, label]) => (
              <div key={label}>
                <div className="mono-l" style={{ color: "var(--accent)", display: "block", marginBottom: 2 }}>{val}</div>
                <div className="body-s" style={{ color: "var(--text-subtle)" }}>{label}</div>
              </div>
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
                desc: "Receive daily or weekly alerts for jobs that match your profile. Salary information included when disclosed.",
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
                  <Link key={cat.slug} href={cat.slug ? `/jobs/category/${cat.slug}` : "/jobs"} className={`chip${i === 0 ? " chip-active" : ""}`}>
                    {cat.label} <span className="chip-count">{cat.count}</span>
                  </Link>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <h2 className="h2">Latest jobs</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {serialisedJobs.map(job => <JobCard key={job.id} {...job} />)}
              </div>

              <div style={{ marginTop: 24 }}>
                <Link href="/jobs" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                  View all {totalJobs} jobs
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
                <JobAlertForm categories={categories.slice(1).map(c => ({ slug: c.slug ?? "", label: c.label }))} />
              </div>

              {/* Hiring CTA */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
                <h3 className="h3" style={{ marginBottom: 8 }}>Hiring in Cyprus?</h3>
                <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                  Reach people looking for technology roles in Cyprus.
                </p>
                <Link href="/post-a-job" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Post a job</Link>
              </div>

              {/* Market snapshot */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
                <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16 }}>FIND YOUR NEXT ROLE</div>
                {[
                  ["Live vacancies", String(totalJobs)],
                  ["Coverage", "Cyprus"],
                  ["Salary details", "When disclosed"],
                  ["Work options", "On-site, hybrid, remote"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span className="body-s" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="mono-s" style={{ color: "var(--text)" }}>{value}</span>
                  </div>
                ))}
                <Link href="/salary-guide" className="mono-s" style={{ color: "var(--accent)", textDecoration: "none", display: "block", marginTop: 14 }}>
                  FULL SALARY GUIDE
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── BROWSE BY CATEGORY ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
        <div className="page-container">
          <div className="section-head" style={{ marginBottom: "clamp(24px, 4vw, 36px)" }}>
            <div>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8 }}>BROWSE BY CATEGORY</div>
              <h2 className="display-m">Find roles in your speciality</h2>
            </div>
            <Link href="/jobs" className="btn btn-outline btn-sm">All jobs</Link>
          </div>
          <div className="grid-4" style={{ gap: "clamp(10px, 2vw, 16px)" }}>
            {categoryGrid.map(cat => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Briefcase;
              const n    = countBySlug.get(cat.slug) ?? 0;
              return (
                <Link
                  key={cat.slug}
                  href={`/jobs/category/${cat.slug}`}
                  style={{ textDecoration: "none", display: "block", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "clamp(16px, 2.5vw, 22px)", transition: "all 180ms var(--ease-out)", cursor: "pointer" }}
                  className="category-card"
                >
                  <div className="category-icon">
                    <Icon size={19} strokeWidth={1.75} aria-hidden />
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{cat.label}</div>
                  <div className="mono-s" style={{ color: "var(--accent)" }}>
                    {n} open {n === 1 ? "role" : "roles"}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CANDIDATE CTA ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", borderBottom: "1px solid var(--border)" }}>
        <div className="page-container">
          <div style={{
            background: "var(--black)", borderRadius: 24,
            padding: "clamp(48px, 7vw, 72px) clamp(24px, 5vw, 64px)",
            position: "relative", overflow: "hidden", textAlign: "center",
          }}>
            {/* Blurred glow blobs */}
            <div style={{ position: "absolute", top: -120, right: -80, width: 400, height: 400, borderRadius: "50%", background: "#FF3D7F", opacity: 0.18, filter: "blur(50px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -100, left: -60, width: 300, height: 300, borderRadius: "50%", background: "#FF3D7F", opacity: 0.1, filter: "blur(40px)", pointerEvents: "none" }} />

            <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,61,127,0.12)", border: "1px solid rgba(255,61,127,0.3)", borderRadius: 99, padding: "6px 14px", marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3D7F", display: "inline-block", flexShrink: 0 }} />
                <span className="mono-s" style={{ color: "#FF3D7F" }}>FOR JOB SEEKERS</span>
              </div>

              {/* Headline */}
              <h2 className="display-l" style={{ color: "var(--white)", marginBottom: 24, lineHeight: 1.1 }}>
                Build your profile.<br />Let the right jobs<br />find you.
              </h2>

              {/* Feature tiles — each benefit in its own box. A leading icon
                  column would introduce a second axis and fight the centred
                  text, so the tile itself does the work of setting them apart.
                  auto-fit collapses 2×2 to a single column on narrow screens. */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, margin: "0 auto 40px" }}>
                {[
                  "Upload your CV and get AI-powered match scores",
                  "Personalised job alerts — daily or weekly",
                  "Save your preferences, salary expectations, and work type",
                  "Free forever for candidates",
                ].map(item => (
                  <div key={item} style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    padding: "18px 16px",
                    minHeight: 76,
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--font-sans)",
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.80)",
                  }}>{item}</div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", maxWidth: 360, margin: "0 auto" }}>
                <Link href="/get-started" className="btn btn-accent btn-lg" style={{ justifyContent: "center", boxShadow: "0 0 40px rgba(255,61,127,0.45)" }}>
                  Create free candidate account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
        <div className="page-container">
          {/* Left-aligned to sit flush with the accordion rows below — a centred
              heading over left-aligned content reads as two separate axes. */}
          <div style={{ marginBottom: "clamp(28px, 4vw, 44px)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>FAQ</div>
            <h2 className="display-m" style={{ marginBottom: 12 }}>Common questions about Cyprus tech jobs</h2>
            <p className="body" style={{ color: "var(--text-muted)" }}>
              Everything you need to know before starting your search.
            </p>
          </div>

          <FaqAccordion faqs={FAQS} />
        </div>
      </section>

      {/* ── EMPLOYER CTA ── */}
      <section style={{ padding: "clamp(48px, 7vw, 80px) 0" }}>
        <div className="page-container">
          <div className="cta-strip" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, padding: "clamp(28px, 5vw, 48px)", border: "1px solid var(--border)", borderRadius: 16, background: "var(--surface)" }}>
            <div>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>FOR EMPLOYERS</div>
              <h2 className="h1" style={{ marginBottom: 8 }}>Hiring tech talent in Cyprus?</h2>
              <p className="body" style={{ color: "var(--text-muted)", maxWidth: 480 }}>
                Post your role for people searching for technology jobs in Cyprus.
                Create an employer account to manage your listings and applications.
              </p>
            </div>
            <div className="btn-group-mobile">
              <Link href="/post-a-job" className="btn btn-accent btn-lg">Post a job</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
