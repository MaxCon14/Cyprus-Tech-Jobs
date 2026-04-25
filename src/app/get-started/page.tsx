import Link from "next/link";
import { Briefcase, Search, ArrowRight, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — CyprusTech.Jobs",
};

const EMPLOYER_PERKS = [
  "Post jobs seen by thousands of Cyprus tech professionals",
  "Salary benchmarks and market insights",
  "Featured listings for maximum visibility",
];

const SEEKER_PERKS = [
  "Instant alerts for roles matching your skills",
  "Salaries always included — no surprises",
  "Remote, hybrid and on-site roles across Cyprus",
];

export default function GetStartedPage() {
  return (
    <div style={{ minHeight: "calc(100vh - 61px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>

      <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 520 }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 16 }}>GET STARTED</div>
        <h1 className="h1" style={{ marginBottom: 12 }}>How are you using CyprusTech.Jobs?</h1>
        <p className="body-l" style={{ color: "var(--text-muted)" }}>
          Choose your path — we'll tailor the experience for you.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "100%", maxWidth: 760 }}>

        {/* Employer card */}
        <Link
          href="/employers/onboarding"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 32,
              background: "var(--surface)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              transition: "border-color 200ms, box-shadow 200ms",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--accent-soft)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
              <Briefcase size={22} style={{ color: "var(--accent)" }} />
            </div>

            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 6 }}>
                I'm hiring
              </div>
              <div className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                Post jobs and connect with the best tech talent in Cyprus.
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {EMPLOYER_PERKS.map(perk => (
                <li key={perk} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <CheckCircle size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                  <span className="body-s" style={{ color: "var(--text-muted)" }}>{perk}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "var(--accent)" }}>
              Create employer account <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Job seeker card */}
        <Link
          href="/candidates/onboarding"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 32,
              background: "var(--surface)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              transition: "border-color 200ms, box-shadow 200ms",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--accent-soft)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--bg-muted)", display: "grid", placeItems: "center" }}>
              <Search size={22} style={{ color: "var(--text-muted)" }} />
            </div>

            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 6 }}>
                I'm looking for work
              </div>
              <div className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                Get personalised job alerts for tech roles in Cyprus.
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {SEEKER_PERKS.map(perk => (
                <li key={perk} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <CheckCircle size={14} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
                  <span className="body-s" style={{ color: "var(--text-muted)" }}>{perk}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "var(--text-muted)" }}>
              Set up job alerts <ArrowRight size={14} />
            </div>
          </div>
        </Link>

      </div>

      <p className="body-s" style={{ color: "var(--text-subtle)", marginTop: 32 }}>
        Already have an employer account?{" "}
        <Link href="/employers/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
          Sign in
        </Link>
      </p>

    </div>
  );
}
