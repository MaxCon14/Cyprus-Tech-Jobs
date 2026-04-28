import type { Metadata } from "next";
import Link from "next/link";
import { comparisons } from "@/data/comparisons";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Tech Job Board in Cyprus — How We Compare",
  description:
    "See how CyprusTech.Jobs compares to Ergodotisi, Carierista, CyprusWork, Kariera.com.cy, and CyprusJobs.com for technology professionals in Cyprus.",
  alternates: { canonical: "/compare" },
};

const competitorLabels: Record<string, string> = {
  ergodotisi: "Ergodotisi",
  cypruswork: "CyprusWork",
  carierista: "Carierista",
  kariera: "Kariera.com.cy",
  cyprusjobs: "CyprusJobs.com",
};

export default function ComparePage() {
  return (
    <main className="page-container" style={{ maxWidth: 800, padding: "60px 24px 80px" }}>
      {/* Hero */}
      <div style={{ marginBottom: 48 }}>
        <p className="body-s" style={{ color: "var(--accent)", fontWeight: 600, marginBottom: 8 }}>
          Platform comparison
        </p>
        <h1 className="heading-xl" style={{ marginBottom: 16 }}>
          CyprusTech.Jobs vs Cyprus job boards
        </h1>
        <p className="body-m" style={{ color: "var(--text-secondary)", maxWidth: 620 }}>
          We built CyprusTech.Jobs specifically for technology professionals in Cyprus. Here&apos;s
          how we compare to the general job boards on the island — on salary transparency, tech
          filtering, and tools for job seekers.
        </p>
      </div>

      {/* Why we're different */}
      <section style={{ marginBottom: 56 }}>
        <h2 className="heading-m" style={{ marginBottom: 20 }}>
          Why a dedicated tech job board?
        </h2>
        <p className="body-m" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
          General job boards in Cyprus cover every industry — hospitality, retail, banking,
          construction, and tech all in one feed. That&apos;s useful if you&apos;re hiring across
          departments, but it creates noise for technology professionals who just want to find
          relevant roles quickly.
        </p>
        <p className="body-m" style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          CyprusTech.Jobs focuses exclusively on software, engineering, data, design, and IT roles
          in Cyprus. Three things we do differently:
        </p>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            "Every listing is a tech role — no filtering required",
            "Salary ranges are required on every job posting",
            "AI-powered CV review scores your application against each role",
          ].map((point) => (
            <li key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <CheckCircle2
                size={18}
                style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}
              />
              <span className="body-m" style={{ color: "var(--text-primary)" }}>
                {point}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Comparison cards */}
      <section>
        <h2 className="heading-m" style={{ marginBottom: 24 }}>
          Head-to-head comparisons
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                border: "1px solid var(--border)",
                borderRadius: 12,
                textDecoration: "none",
                background: "var(--surface)",
                transition: "border-color 0.15s",
              }}
              className="compare-card-link"
            >
              <div>
                <p className="body-s" style={{ color: "var(--text-secondary)", marginBottom: 4 }}>
                  CyprusTech.Jobs vs
                </p>
                <p
                  className="body-m"
                  style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}
                >
                  {competitorLabels[c.slug] ?? c.competitor.name}
                </p>
                <p className="body-s" style={{ color: "var(--text-secondary)" }}>
                  {c.competitor.tagline}
                </p>
              </div>
              <ArrowRight size={18} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          marginTop: 64,
          padding: "32px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <h2 className="heading-s" style={{ marginBottom: 8 }}>
          Ready to find your next tech role in Cyprus?
        </h2>
        <p className="body-s" style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
          Browse tech jobs, set up salary-filtered alerts, or let our AI review your CV.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/jobs" className="btn btn-primary">
            Browse tech jobs
          </Link>
          <Link href="/candidates/onboarding" className="btn btn-secondary">
            Create a free profile
          </Link>
        </div>
      </section>
    </main>
  );
}
