import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

type Role = "candidate" | "employer" | "guest";

async function getRole(): Promise<Role> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return "guest";

    const employer = await prisma.employer.findUnique({
      where: { email: user.email },
      select: { id: true },
    });
    if (employer) return "employer";

    const { data: candidate } = await supabaseAdmin
      .from("candidates").select("id").eq("email", user.email).single();
    if (candidate) return "candidate";
  } catch {
    // Non-fatal — fall back to guest links
  }
  return "guest";
}

const CANDIDATE_LINKS = [
  ["Browse jobs",    "/jobs"],
  ["My dashboard",   "/candidates/dashboard"],
  ["Companies",      "/companies"],
  ["Salary guide",   "/salary-guide"],
  ["Job alerts",     "/jobs#alerts"],
] as const;

const EMPLOYER_LINKS = [
  ["Post a job",        "/post-a-job"],
  ["My dashboard",      "/employers/dashboard"],
  ["Buy listing slots", "/buy-credits"],
] as const;

const GUEST_CANDIDATE_LINKS = [
  ["Browse jobs",   "/jobs"],
  ["Companies",     "/companies"],
  ["Salary guide",  "/salary-guide"],
  ["Job alerts",    "/jobs#alerts"],
] as const;

const GUEST_EMPLOYER_LINKS = [
  ["Post a job",         "/post-a-job"],
  ["Employer dashboard", "/employers/dashboard"],
] as const;

const CITY_LINKS = [
  ["Nicosia",  "/jobs/nicosia"  ],
  ["Limassol", "/jobs/limassol" ],
  ["Larnaca",  "/jobs/larnaca"  ],
  ["Paphos",   "/jobs/paphos"   ],
  ["Remote",   "/jobs/remote"   ],
] as const;

const COMPANY_LINKS = [
  ["Blog",             "/blog"],
  ["FAQ",              "/faq"],
  ["Privacy policy",   "/privacy"],
  ["Terms of service", "/terms"],
  ["Contact",          "/contact"],
] as const;

function SocialLinks() {
  const iconStyle = { width: 16, height: 16, fill: "currentColor", display: "block" };

  const socials = [
    {
      label: "Medium",
      href: "https://medium.com/@cyprustech.careers",
      active: true,
      icon: (
        <svg viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42S14.2 15.54 14.2 12s1.51-6.42 3.38-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75S21.62 15.17 21.62 12s.53-5.75 1.19-5.75S24 8.83 24 12z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: null,
      active: false,
      icon: (
        <svg viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: null,
      active: false,
      icon: (
        <svg viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: null,
      active: false,
      icon: (
        <svg viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
      {socials.map(({ label, href, active, icon }) =>
        active && href ? (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid var(--border)",
              display: "grid", placeItems: "center",
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "color 150ms, border-color 150ms",
            }}
            className="social-icon"
          >
            {icon}
          </a>
        ) : (
          <span
            key={label}
            title={`${label} — coming soon`}
            aria-label={`${label} — coming soon`}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid var(--border)",
              display: "grid", placeItems: "center",
              color: "var(--text-subtle)",
              opacity: 0.4,
              cursor: "default",
            }}
          >
            {icon}
          </span>
        )
      )}
    </div>
  );
}

function FooterLinks({ links }: { links: readonly (readonly [string, string])[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {links.map(([label, href]) => (
        <Link key={href} href={href} style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
          {label}
        </Link>
      ))}
    </div>
  );
}

export async function Footer() {
  const role = await getRole();

  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "clamp(32px, 5vw, 48px) var(--page-padding-x)", marginTop: "auto" }}>
      <div className="page-container">
        <div className={role === "guest" ? "grid-5" : "grid-4"} style={{ gap: "clamp(24px, 4vw, 32px)", marginBottom: "clamp(32px, 5vw, 48px)" }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", marginBottom: 8, color: "var(--text)" }}>
              CyprusTech<span style={{ color: "var(--accent)" }}>.Jobs</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)", maxWidth: 220, margin: 0 }}>
              The home for tech jobs in Cyprus. Find your next role or hire great talent.
            </p>
            <SocialLinks />
          </div>

          {/* Role-specific middle columns */}
          {role === "candidate" && (
            <div>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>For you</div>
              <FooterLinks links={CANDIDATE_LINKS} />
            </div>
          )}

          {role === "employer" && (
            <div>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>For you</div>
              <FooterLinks links={EMPLOYER_LINKS} />
            </div>
          )}

          {role === "guest" && (
            <>
              <div>
                <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>For candidates</div>
                <FooterLinks links={GUEST_CANDIDATE_LINKS} />
              </div>
              <div>
                <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>For employers</div>
                <FooterLinks links={GUEST_EMPLOYER_LINKS} />
              </div>
            </>
          )}

          {/* Jobs by city — always shown */}
          <div>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Jobs by city</div>
            <FooterLinks links={CITY_LINKS} />
          </div>

          {/* Company — always shown */}
          <div>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Company</div>
            <FooterLinks links={COMPANY_LINKS} />
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid var(--border)", paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <span className="mono-s" style={{ color: "var(--text-subtle)" }}>
            © {new Date().getFullYear()} CYPRUSTECHJOBS · ALL RIGHTS RESERVED
          </span>
          <span className="mono-s" style={{ color: "var(--text-subtle)" }}>
            BUILT FOR CYPRUS TECH · v1.0
          </span>
        </div>
      </div>
    </footer>
  );
}
