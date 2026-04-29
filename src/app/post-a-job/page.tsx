import Link from "next/link";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { PostJobForm } from "./PostJobForm";

export const metadata: Metadata = {
  title: "Post a Job — Hire Tech Talent in Cyprus",
  description: "Post a tech job in Cyprus and reach thousands of active candidates. Listings go live within minutes.",
};

export default async function PostAJobPage() {
  // Fetch employer context for pre-filling "Posting as…"
  let companyName: string | undefined;
  let companySlug: string | undefined;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const employer = await prisma.employer.findUnique({
        where: { email: user.email },
        include: { company: true },
      });
      if (employer?.company) {
        companyName = employer.company.name;
        companySlug = employer.company.slug;
      }
    }
  } catch {
    // Non-fatal — form still works, just won't show "Posting as"
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "clamp(40px, 6vw, 64px) var(--page-padding-x) clamp(36px, 5vw, 56px)", background: "var(--bg-alt)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            FOR EMPLOYERS · CYPRUSTECHCAREERS
          </div>
          <h1 className="display-l" style={{ marginBottom: 16 }}>
            Hire tech talent<br />
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>in Cyprus.</em>
          </h1>
          <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 540, margin: "0 auto 32px" }}>
            Reach thousands of developers, designers, and engineers actively looking for roles in Cyprus. Listings go live within minutes.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {[
              ["5,000+", "registered candidates"],
              ["248",    "active listings"],
              ["2–5 days", "average time to apply"],
            ].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div className="mono-l" style={{ color: "var(--accent)" }}>{val}</div>
                <div className="body-s" style={{ color: "var(--text-subtle)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingBlock: "clamp(40px, 6vw, 64px)" }}>
        <div className="layout-sidebar-right">

          {/* Form (plan picker + job form) */}
          <PostJobForm companyName={companyName} companySlug={companySlug} />

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
              <h3 className="h3" style={{ marginBottom: 16 }}>Why CyprusTech.Careers?</h3>
              {[
                ["Niche audience", "Every visitor is a tech professional actively looking for work in Cyprus."],
                ["Salary transparency", "Listings with salaries get 2× more applications. We encourage it."],
                ["Fast turnaround", "Listings are reviewed and live within 30 minutes."],
                ["Job alerts", "Your role is emailed to matching candidates the moment it goes live."],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                    <Check size={10} style={{ color: "var(--accent)" }} />
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{title}</div>
                    <div className="body-s" style={{ color: "var(--text-muted)" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>COMPANIES WHO TRUST US</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Revolut", "Wargaming", "XM Group", "eToro", "Exness"].map(n => (
                  <span key={n} className="tag">{n}</span>
                ))}
              </div>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8 }}>NEED HELP?</div>
              <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 12 }}>
                Questions about posting or want to discuss a custom package?
              </p>
              <Link href="/contact" className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                Contact us
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
