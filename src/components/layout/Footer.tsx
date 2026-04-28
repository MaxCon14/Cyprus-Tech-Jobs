import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "clamp(32px, 5vw, 48px) var(--page-padding-x)", marginTop: "auto" }}>
      <div className="page-container">
        <div className="grid-5" style={{ gap: "clamp(24px, 4vw, 32px)", marginBottom: "clamp(32px, 5vw, 48px)" }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", marginBottom: 8, color: "var(--text)" }}>
              CyprusTech<span style={{ color: "var(--accent)" }}>.Jobs</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)", maxWidth: 220, margin: 0 }}>
              The home for tech jobs in Cyprus. Find your next role or hire great talent.
            </p>
          </div>

          {/* For candidates */}
          <div>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>For candidates</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Browse jobs",   "/jobs"],
                ["Companies",     "/companies"],
                ["Salary guide",  "/salary-guide"],
                ["Job alerts",    "/jobs#alerts"],
              ].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* For employers */}
          <div>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>For employers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Post a job",          "/post-a-job"],
                ["Employer dashboard",  "/employers/dashboard"],
                ["Pricing",             "/post-a-job#pricing"],
              ].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Compare */}
          <div>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Compare us with</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Ergodotisi",      "/compare/ergodotisi"],
                ["CyprusWork",      "/compare/cypruswork"],
                ["Carierista",      "/compare/carierista"],
                ["Kariera.com.cy",  "/compare/kariera"],
                ["CyprusJobs.com",  "/compare/cyprusjobs"],
              ].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>Company</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["About",            "/about"],
                ["Privacy policy",   "/privacy"],
                ["Terms of service", "/terms"],
                ["Contact",          "/contact"],
              ].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
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
