"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  LogOut, LayoutDashboard, ChevronDown, Menu, X,
  Briefcase, MapPin, Clock, ArrowRight,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const supabase = createSupabaseBrowserClient();

/* ── Data ─────────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { label: "Frontend",         slug: "frontend" },
  { label: "Backend",          slug: "backend" },
  { label: "DevOps & Cloud",   slug: "devops" },
  { label: "UI/UX Design",     slug: "design" },
  { label: "Data & Analytics", slug: "data" },
  { label: "Mobile",           slug: "mobile" },
  { label: "Product",          slug: "product" },
  { label: "Security",         slug: "security" },
  { label: "QA & Testing",     slug: "qa" },
];

const JOB_TYPES = [
  { label: "Full-time",  value: "FULL_TIME" },
  { label: "Part-time",  value: "PART_TIME" },
  { label: "Contract",   value: "CONTRACT" },
];

const CITIES = ["Limassol", "Nicosia", "Larnaca", "Paphos", "Remote"];

const staticLinks = [
  { href: "/companies",    label: "Companies" },
  { href: "/salary-guide", label: "Salary guide" },
];

/* ── Reusable accordion section ───────────────────────────────────────────── */

function NavSection({
  icon, title, children, defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="nav-section">
      <button
        className={`nav-section-toggle${open ? " open" : ""}`}
        onClick={() => setOpen(v => !v)}
      >
        <span className="nav-section-icon">{icon}</span>
        <span className="nav-section-label">{title}</span>
        <ChevronDown size={12} className={`nav-chevron nav-section-chevron${open ? " open" : ""}`} />
      </button>

      <div
        style={{
          maxHeight: open ? `${innerRef.current?.scrollHeight ?? 500}px` : "0px",
          overflow: "hidden",
          transition: "max-height 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div ref={innerRef} style={{ padding: "4px 0 8px 28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Jobs Dropdown ────────────────────────────────────────────────────────── */

function JobsDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="nav-mega-menu">
      <div style={{ padding: "12px" }}>

        <NavSection icon={<Briefcase size={13} />} title="By Category" defaultOpen>
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/jobs?category=${cat.slug}`} className="nav-dropdown-item" onClick={onClose}>
              {cat.label}
            </Link>
          ))}
        </NavSection>

        <NavSection icon={<Clock size={13} />} title="Job Type">
          {JOB_TYPES.map(t => (
            <Link key={t.value} href={`/jobs?type=${t.value}`} className="nav-dropdown-item" onClick={onClose}>
              {t.label}
            </Link>
          ))}
        </NavSection>

        <NavSection icon={<MapPin size={13} />} title="City">
          {CITIES.map(city => (
            <Link key={city} href={`/jobs?city=${city}`} className="nav-dropdown-item" onClick={onClose}>
              {city}
            </Link>
          ))}
        </NavSection>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 6 }}>
          <Link href="/jobs" className="nav-dropdown-cta" onClick={onClose}>
            Browse all jobs <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </div>
  );
}

/* ── Nav ──────────────────────────────────────────────────────────────────── */

export function Nav() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobsOpen,       setJobsOpen]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [mobileJobsOpen, setMobileJobsOpen] = useState(false);
  const [mobileCatOpen,  setMobileCatOpen]  = useState(false);
  const [mobileTypeOpen, setMobileTypeOpen] = useState(false);
  const [mobileCityOpen, setMobileCityOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auth */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setUser(s?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* Close menus on route change */
  useEffect(() => {
    setMobileOpen(false);
    setJobsOpen(false);
  }, [pathname]);

  /* Body scroll lock when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const openJobs  = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setJobsOpen(true); };
  const closeJobs = () => { closeTimer.current = setTimeout(() => setJobsOpen(false), 150); };

  return (
    <>
      <header style={{
        borderBottom: "1px solid var(--border)", background: "var(--surface)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: "var(--page-max-w)", margin: "0 auto", padding: "0 var(--page-padding-x)", width: "100%", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 6, display: "grid", placeItems: "center", color: "var(--white)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-sans)", letterSpacing: "-0.02em", flexShrink: 0 }}>
              C
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", color: "var(--text)" }}>
              CyprusTech<span style={{ color: "var(--accent)" }}>.Jobs</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-links-desktop" style={{ alignItems: "center", gap: 2, flex: 1 }}>

            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={openJobs}
              onMouseLeave={closeJobs}
            >
              <button
                className={`nav-link nav-link-btn${pathname.startsWith("/jobs") ? " nav-link-active" : ""}`}
                onClick={() => setJobsOpen(v => !v)}
                aria-expanded={jobsOpen}
              >
                Jobs <ChevronDown size={13} className={`nav-chevron${jobsOpen ? " open" : ""}`} />
              </button>

              {jobsOpen && (
                <div
                  className="nav-mega-container"
                  onMouseEnter={openJobs}
                  onMouseLeave={closeJobs}
                >
                  <JobsDropdown onClose={() => setJobsOpen(false)} />
                </div>
              )}
            </div>

            {staticLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${pathname.startsWith(link.href) ? " nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="nav-links-desktop" style={{ alignItems: "center", gap: 8, flexShrink: 0 }}>
            {!loading && user ? (
              <>
                <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <LayoutDashboard size={13} /> Dashboard
                </Link>
                <button onClick={handleSignOut} className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
                  <LogOut size={13} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                <Link href="/get-started" className="btn btn-primary btn-sm">Get started</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <div style={{ padding: "16px var(--page-padding-x) 40px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Jobs top-level toggle */}
          <div>
            <button
              className="mobile-menu-section-btn"
              onClick={() => setMobileJobsOpen(v => !v)}
            >
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16, color: "var(--text)" }}>
                Jobs
              </span>
              <ChevronDown size={16} className={`nav-chevron${mobileJobsOpen ? " open" : ""}`} style={{ color: "var(--text-muted)" }} />
            </button>

            <div className={`mobile-menu-sub${mobileJobsOpen ? " open" : ""}`}>
              <div style={{ padding: "4px 0 12px" }}>

                {/* Category sub-section */}
                <button
                  className="mobile-sub-section-btn"
                  onClick={() => setMobileCatOpen(v => !v)}
                >
                  <Briefcase size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <span>By Category</span>
                  <ChevronDown size={13} className={`nav-chevron${mobileCatOpen ? " open" : ""}`} style={{ color: "var(--text-muted)", marginLeft: "auto" }} />
                </button>
                <div className={`mobile-menu-sub${mobileCatOpen ? " open" : ""}`}>
                  <div style={{ paddingLeft: 12, paddingBottom: 8 }}>
                    {CATEGORIES.map(cat => (
                      <Link key={cat.slug} href={`/jobs?category=${cat.slug}`} className="mobile-menu-link">
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Job Type sub-section */}
                <button
                  className="mobile-sub-section-btn"
                  onClick={() => setMobileTypeOpen(v => !v)}
                >
                  <Clock size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <span>Job Type</span>
                  <ChevronDown size={13} className={`nav-chevron${mobileTypeOpen ? " open" : ""}`} style={{ color: "var(--text-muted)", marginLeft: "auto" }} />
                </button>
                <div className={`mobile-menu-sub${mobileTypeOpen ? " open" : ""}`}>
                  <div style={{ paddingLeft: 12, paddingBottom: 8 }}>
                    {JOB_TYPES.map(t => (
                      <Link key={t.value} href={`/jobs?type=${t.value}`} className="mobile-menu-link">
                        {t.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* City sub-section */}
                <button
                  className="mobile-sub-section-btn"
                  onClick={() => setMobileCityOpen(v => !v)}
                >
                  <MapPin size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <span>City</span>
                  <ChevronDown size={13} className={`nav-chevron${mobileCityOpen ? " open" : ""}`} style={{ color: "var(--text-muted)", marginLeft: "auto" }} />
                </button>
                <div className={`mobile-menu-sub${mobileCityOpen ? " open" : ""}`}>
                  <div style={{ paddingLeft: 12, paddingBottom: 8 }}>
                    {CITIES.map(city => (
                      <Link key={city} href={`/jobs?city=${city}`} className="mobile-menu-link">
                        {city}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href="/jobs" className="mobile-menu-link" style={{ fontWeight: 500, color: "var(--accent)", marginTop: 4, display: "block" }}>
                  Browse all jobs →
                </Link>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

          {staticLinks.map(link => (
            <Link key={link.href} href={link.href} className="mobile-menu-top-link">
              {link.label}
            </Link>
          ))}

          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

          <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {!loading && user ? (
              <>
                <Link href="/dashboard" className="btn btn-primary" style={{ justifyContent: "center" }}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={handleSignOut} className="btn btn-ghost" style={{ justifyContent: "center", color: "var(--text-muted)" }}>
                  <LogOut size={15} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/get-started" className="btn btn-accent" style={{ justifyContent: "center" }}>
                  Get started — it&apos;s free
                </Link>
                <Link href="/login" className="btn btn-outline" style={{ justifyContent: "center" }}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
