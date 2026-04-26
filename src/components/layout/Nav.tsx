"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  LogOut, LayoutDashboard, ChevronDown, ChevronRight, Menu, X,
  Briefcase, MapPin, Clock, ArrowRight,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const supabase = createSupabaseBrowserClient();

/* ── Data ─────────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { label: "Frontend",        slug: "frontend" },
  { label: "Backend",         slug: "backend" },
  { label: "DevOps & Cloud",  slug: "devops" },
  { label: "UI/UX Design",    slug: "design" },
  { label: "Data & Analytics",slug: "data" },
  { label: "Mobile",          slug: "mobile" },
  { label: "Product",         slug: "product" },
  { label: "Security",        slug: "security" },
  { label: "QA & Testing",    slug: "qa" },
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

/* ── Jobs Dropdown (flyout) ───────────────────────────────────────────────── */

type FlyoutSection = "category" | "type" | "city";

const FLYOUT_SECTIONS: { key: FlyoutSection; label: string; icon: React.ReactNode }[] = [
  { key: "category", label: "By Category", icon: <Briefcase size={13} /> },
  { key: "type",     label: "Job Type",    icon: <Clock size={13} /> },
  { key: "city",     label: "City",        icon: <MapPin size={13} /> },
];

const FLYOUT_ITEMS: Record<FlyoutSection, { label: string; href: string }[]> = {
  category: CATEGORIES.map(c => ({ label: c.label, href: `/jobs?category=${c.slug}` })),
  type:     JOB_TYPES.map(t => ({ label: t.label,  href: `/jobs?type=${t.value}` })),
  city:     CITIES.map(c =>    ({ label: c,         href: `/jobs?city=${c}` })),
};

function JobsDropdown({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<FlyoutSection>("category");

  return (
    <div className="nav-mega-menu">
      <div className="nav-flyout-layout">

        {/* Left: primary items */}
        <div className="nav-flyout-primary">
          {FLYOUT_SECTIONS.map(s => (
            <div
              key={s.key}
              className={`nav-flyout-item${active === s.key ? " active" : ""}`}
              onMouseEnter={() => setActive(s.key)}
            >
              <span className="nav-flyout-item-icon">{s.icon}</span>
              <span className="nav-flyout-item-label">{s.label}</span>
              <ChevronRight size={11} className="nav-flyout-item-arrow" />
            </div>
          ))}

          <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <Link href="/jobs" className="nav-dropdown-cta" onClick={onClose}>
              Browse all jobs <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right: sub-items for active section */}
        <div className="nav-flyout-secondary">
          <div className="nav-dropdown-heading" style={{ marginBottom: 6 }}>
            {FLYOUT_SECTIONS.find(s => s.key === active)?.icon}
            {FLYOUT_SECTIONS.find(s => s.key === active)?.label}
          </div>
          {FLYOUT_ITEMS[active].map(item => (
            <Link key={item.href} href={item.href} className="nav-dropdown-item" onClick={onClose}>
              {item.label}
            </Link>
          ))}
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
  const [jobsOpen,    setJobsOpen]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mobileJobsOpen, setMobileJobsOpen] = useState(false);
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

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
    setJobsOpen(false);
  }, [pathname]);

  /* Prevent body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  /* Hover handlers with delay so fast mouse-moves don't flicker */
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

            {/* Jobs dropdown trigger */}
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

          {/* Hamburger (mobile only) */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu overlay ── */}
      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <div style={{ padding: "16px var(--page-padding-x) 40px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Jobs section */}
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
              <div style={{ padding: "8px 0 16px" }}>

                <div className="mobile-menu-subheading">By Category</div>
                {CATEGORIES.map(cat => (
                  <Link key={cat.slug} href={`/jobs?category=${cat.slug}`} className="mobile-menu-link">
                    {cat.label}
                  </Link>
                ))}

                <div className="mobile-menu-subheading" style={{ marginTop: 16 }}>Job Type</div>
                {JOB_TYPES.map(t => (
                  <Link key={t.value} href={`/jobs?type=${t.value}`} className="mobile-menu-link">
                    {t.label}
                  </Link>
                ))}

                <div className="mobile-menu-subheading" style={{ marginTop: 16 }}>City</div>
                {CITIES.map(city => (
                  <Link key={city} href={`/jobs?city=${city}`} className="mobile-menu-link">
                    {city}
                  </Link>
                ))}
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

          {/* Auth */}
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
