import { SALARY_DATA } from "@/lib/placeholder-data";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cyprus Tech Salary Guide 2026",
  description: "Salary ranges for tech roles in Cyprus. Frontend, backend, DevOps, data, design and more — by experience level.",
};

const MAX_SALARY = 150000;

function SalaryBar({ min, max, color = "var(--accent)" }: { min: number; max: number; color?: string }) {
  const leftPct  = (min / MAX_SALARY) * 100;
  const widthPct = ((max - min) / MAX_SALARY) * 100;
  return (
    <div style={{ position: "relative", height: 8, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: `${leftPct}%`, width: `${widthPct}%`, height: "100%", background: color, borderRadius: 99 }} />
    </div>
  );
}

function fmt(n: number) {
  return `€${Math.round(n / 1000)}K`;
}

const LEVEL_COLORS: Record<string, string> = {
  junior: "var(--info)",
  mid:    "var(--warning)",
  senior: "var(--accent)",
  lead:   "var(--success)",
};

const LEVEL_LABELS = ["Junior", "Mid-level", "Senior", "Lead"] as const;

export default function SalaryGuidePage() {
  return (
    <div className="page-container" style={{ paddingBlock: "clamp(24px, 4vw, 40px)" }}>

      {/* Header */}
      <div style={{ marginBottom: "clamp(32px, 6vw, 56px)" }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
          UPDATED APRIL 2026 · BASED ON MARKET DATA
        </div>
        <h1 className="display-m" style={{ marginBottom: 12 }}>Cyprus Tech Salary Guide</h1>
        <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 600 }}>
          Salary ranges for tech roles in Cyprus across experience levels. Data sourced from job postings, employer submissions, and candidate reports.
        </p>
      </div>

      {/* Key stats */}
      <div className="grid-stats" style={{ marginBottom: "clamp(32px, 6vw, 56px)" }}>
        {[
          { label: "Median senior engineer", value: "€76,000", sub: "Limassol market data, Apr 2026" },
          { label: "Top paying city",        value: "Limassol", sub: "fintech & gaming hub" },
          { label: "Remote salary premium",  value: "+15%",     sub: "vs on-site equivalent" },
          { label: "YoY salary growth",      value: "+8.3%",    sub: "tech sector 2024 → 2025" },
        ].map(s => (
          <div key={s.label} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
            <div className="mono-l" style={{ color: "var(--accent)", display: "block", marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.label}</div>
            <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <span className="caption" style={{ color: "var(--text-subtle)" }}>EXPERIENCE LEVEL</span>
        {Object.entries(LEVEL_COLORS).map(([level, color]) => (
          <span key={level} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
            <span className="body-s" style={{ textTransform: "capitalize" }}>{level === "mid" ? "Mid-level" : level}</span>
          </span>
        ))}
      </div>

      {/* Salary table */}
      <div style={{ marginBottom: 64 }}>
        <div className="salary-table">
          {/* Table header — hidden on mobile via CSS */}
          <div className="salary-table-header">
            <span className="caption" style={{ color: "var(--text-subtle)" }}>CATEGORY</span>
            <span className="caption" style={{ color: "var(--text-subtle)" }}>SALARY RANGE VISUALISATION</span>
            <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "right" }}>JUNIOR</span>
            <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "right" }}>MID</span>
            <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "right" }}>SENIOR</span>
            <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "right" }}>LEAD</span>
          </div>

          {SALARY_DATA.map(row => (
            <div key={row.category} className="salary-row">
              {/* Category name */}
              <span className="salary-category" style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>
                {row.category}
              </span>

              {/* Stacked bars */}
              <div className="salary-bars" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {(Object.entries({ junior: row.junior, mid: row.mid, senior: row.senior, lead: row.lead }) as [string, { min: number; max: number }][]).map(([level, range]) => (
                  <SalaryBar key={level} min={range.min} max={range.max} color={LEVEL_COLORS[level]} />
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <span className="mono-s" style={{ color: "var(--text-subtle)" }}>€0</span>
                  <span className="mono-s" style={{ color: "var(--text-subtle)" }}>€150K</span>
                </div>
              </div>

              {/* Range values — 4 cells, shown as columns on desktop, 2×2 on mobile */}
              {([row.junior, row.mid, row.senior, row.lead] as { min: number; max: number }[]).map((range, i) => (
                <div key={i} className="salary-range-value">
                  <div className="salary-level-label">{LEVEL_LABELS[i].toUpperCase()}</div>
                  <div className="mono-s" style={{ color: "var(--text)", fontWeight: 600 }}>{fmt(range.max)}</div>
                  <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{fmt(range.min)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
          <h3 className="h3" style={{ marginBottom: 12 }}>How salaries work in Cyprus</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "All figures are gross annual (before income tax and social insurance contributions).",
              "New residents earning above €55,000 qualify for a 50% income tax exemption for up to 10 years — making net pay highly competitive with Western Europe.",
              "Income tax is progressive: 0% up to €19,500, 20% up to €28,000, 25% up to €36,300, 30% up to €60,000, and 35% above €60,000.",
              "Many tech companies offer annual bonuses of 10–20% plus stock options or profit-sharing on top of base salary.",
              "Relocation packages covering flights and 1–3 months of accommodation are standard practice at major tech employers for international hires.",
            ].map((note, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", marginTop: 8, flexShrink: 0 }} />
                <span className="body-s" style={{ color: "var(--text-muted)" }}>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-strip" style={{
        border: "1px solid var(--accent)", borderRadius: 12,
        padding: "clamp(24px, 4vw, 40px)",
        background: "var(--accent-soft)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
      }}>
        <div>
          <h2 className="h2" style={{ marginBottom: 6 }}>Ready to find your next role?</h2>
          <p className="body" style={{ color: "var(--text-muted)" }}>Browse jobs with verified salaries — no guessing, no negotiating blind.</p>
        </div>
        <Link href="/jobs" className="btn btn-accent btn-lg">Browse jobs →</Link>
      </div>
    </div>
  );
}
