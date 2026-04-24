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

export default function SalaryGuidePage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: 56 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }}>
        {[
          { label: "Median senior engineer", value: "€75,000", sub: "across all disciplines" },
          { label: "Top paying city",        value: "Limassol", sub: "68% of senior roles" },
          { label: "Remote salary premium",  value: "+12%",     sub: "vs on-site equivalent" },
          { label: "YoY salary growth",      value: "+8.4%",    sub: "senior tech roles" },
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
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 64 }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 90px 90px 90px 90px", gap: 16, padding: "10px 20px" }}>
          <span className="caption" style={{ color: "var(--text-subtle)" }}>CATEGORY</span>
          <span className="caption" style={{ color: "var(--text-subtle)" }}>SALARY RANGE VISUALISATION</span>
          <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "right" }}>JUNIOR</span>
          <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "right" }}>MID</span>
          <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "right" }}>SENIOR</span>
          <span className="caption" style={{ color: "var(--text-subtle)", textAlign: "right" }}>LEAD</span>
        </div>

        {SALARY_DATA.map(row => (
          <div
            key={row.category}
            style={{ display: "grid", gridTemplateColumns: "200px 1fr 90px 90px 90px 90px", gap: 16, padding: "20px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", alignItems: "center" }}
          >
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>{row.category}</span>

            {/* Stacked bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {(Object.entries({ junior: row.junior, mid: row.mid, senior: row.senior, lead: row.lead }) as [string, { min: number; max: number }][]).map(([level, range]) => (
                <SalaryBar key={level} min={range.min} max={range.max} color={LEVEL_COLORS[level]} />
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span className="mono-s" style={{ color: "var(--text-subtle)" }}>€0</span>
                <span className="mono-s" style={{ color: "var(--text-subtle)" }}>€150K</span>
              </div>
            </div>

            {/* Range values */}
            {([row.junior, row.mid, row.senior, row.lead] as { min: number; max: number }[]).map((range, i) => (
              <div key={i} style={{ textAlign: "right" }}>
                <div className="mono-s" style={{ color: "var(--text)", fontWeight: 600 }}>{fmt(range.max)}</div>
                <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{fmt(range.min)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 64 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
          <h3 className="h3" style={{ marginBottom: 12 }}>How salaries work in Cyprus</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Salaries are quoted gross (before income tax and social insurance).",
              "Cyprus has a flat 35% income tax rate above €60,000. There's also a 60-day rule for non-dom residents that can reduce tax significantly.",
              "Many fintech and gaming companies offer stock options on top of base salary.",
              "Relocation packages (flights + 1–3 months accommodation) are common for international hires.",
              "Annual bonus of 10–20% is standard at larger companies like Revolut, Wargaming, and XM.",
            ].map((note, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", marginTop: 8, flexShrink: 0 }} />
                <span className="body-s" style={{ color: "var(--text-muted)" }}>{note}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
          <h3 className="h3" style={{ marginBottom: 12 }}>Top-paying companies</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { name: "Revolut",    range: "€75K – €130K", city: "Limassol" },
              { name: "Wargaming",  range: "€70K – €120K", city: "Nicosia" },
              { name: "eToro",      range: "€65K – €110K", city: "Limassol" },
              { name: "XM Group",   range: "€55K – €105K", city: "Limassol" },
              { name: "Exness",     range: "€60K – €100K", city: "Limassol" },
            ].map(co => (
              <div key={co.name} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>{co.name}</span>
                  <span className="mono-s" style={{ color: "var(--text-subtle)", marginLeft: 8 }}>{co.city}</span>
                </div>
                <span className="mono-s" style={{ color: "var(--accent)" }}>{co.range}</span>
              </div>
            ))}
          </div>
          <Link href="/companies" className="mono-s" style={{ color: "var(--text-subtle)", textDecoration: "none", display: "block", marginTop: 14 }}>
            VIEW ALL COMPANIES →
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div style={{ border: "1px solid var(--accent)", borderRadius: 12, padding: 40, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <h2 className="h2" style={{ marginBottom: 6 }}>Ready to find your next role?</h2>
          <p className="body" style={{ color: "var(--text-muted)" }}>Browse jobs with verified salaries — no guessing, no negotiating blind.</p>
        </div>
        <Link href="/jobs" className="btn btn-accent btn-lg">Browse jobs →</Link>
      </div>
    </div>
  );
}
