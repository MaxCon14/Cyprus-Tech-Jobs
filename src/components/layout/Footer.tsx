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
  ["Pricing",           "/post-a-job#pricing"],
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
  ["Pricing",            "/post-a-job#pricing"],
] as const;

const COMPANY_LINKS = [
  ["About",            "/about"],
  ["FAQ",              "/faq"],
  ["Privacy policy",   "/privacy"],
  ["Terms of service", "/terms"],
  ["Contact",          "/contact"],
] as const;

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
        <div className="grid-4" style={{ gap: "clamp(24px, 4vw, 32px)", marginBottom: "clamp(32px, 5vw, 48px)" }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", marginBottom: 8, color: "var(--text)" }}>
              CyprusTech<span style={{ color: "var(--accent)" }}>.Jobs</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6, color: "var(--text-muted)", maxWidth: 220, margin: 0 }}>
              The home for tech jobs in Cyprus. Find your next role or hire great talent.
            </p>
          </div>

          {/* Role-specific middle columns */}
          {role === "candidate" && (
            <>
              <div>
                <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>For you</div>
                <FooterLinks links={CANDIDATE_LINKS} />
              </div>
              {/* Empty fourth column — keeps grid balanced */}
              <div />
            </>
          )}

          {role === "employer" && (
            <>
              <div>
                <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>For you</div>
                <FooterLinks links={EMPLOYER_LINKS} />
              </div>
              {/* Empty fourth column */}
              <div />
            </>
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
