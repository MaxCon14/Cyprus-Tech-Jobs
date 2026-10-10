import Link from "next/link";
import type { Metadata } from "next";

const title = "Cyprus Tech Salary Guide — Compare Job Offers";
const description = "Compare tech job offers in Cyprus: base pay, payment frequency, benefits, and questions to ask employers. Salary figures appear only when disclosed.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: "https://cyprustech.careers/salary-guide" },
  openGraph: { title, description, url: "https://cyprustech.careers/salary-guide", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

const checks = [
  { title: "Base pay", detail: "Ask for the gross base salary, currency, and whether the quoted amount is annual, monthly, or hourly." },
  { title: "Payment schedule", detail: "Confirm the number of payments per year and which amounts are guaranteed. Compare offers on the same annual basis." },
  { title: "Variable pay", detail: "Separate guaranteed salary from discretionary bonuses, commission, and equity. Ask how each is calculated and when it is paid." },
  { title: "Benefits and costs", detail: "Compare leave, insurance, pension contributions, equipment, commuting costs, and any relocation support in writing." },
];

export default function SalaryGuidePage() {
  return (
    <div className="page-container" style={{ paddingBlock: "clamp(24px, 4vw, 40px)" }}>
      <div style={{ marginBottom: "clamp(32px, 6vw, 56px)" }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 10 }}>PAY &amp; OFFER COMPARISON</div>
        <h1 className="display-m" style={{ marginBottom: 12 }}>Cyprus Tech Salary Guide</h1>
        <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 680 }}>
          A practical checklist for comparing technology job offers in Cyprus. We show pay on listings when the employer discloses it.
        </p>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)", marginBottom: 32 }}>
        <h2 className="h2" style={{ marginBottom: 12 }}>About our salary data</h2>
        <p className="body" style={{ color: "var(--text-muted)" }}>
          We do not yet have a verified, representative salary dataset to publish benchmarks by role, experience level, or city.
          Previous illustrative figures have been removed. Individual advertised ranges should be checked with the employer and do not represent the whole Cyprus market.
        </p>
      </div>

      <div className="grid-stats" style={{ marginBottom: 40 }}>
        {checks.map(check => (
          <div key={check.title} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
            <h2 className="h3" style={{ marginBottom: 10 }}>{check.title}</h2>
            <p className="body-s" style={{ color: "var(--text-muted)" }}>{check.detail}</p>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)", marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 12 }}>Questions to ask before accepting</h2>
        <ul className="body" style={{ color: "var(--text-muted)", paddingLeft: 24, lineHeight: 1.8 }}>
          <li>What is the guaranteed gross annual base pay, excluding bonuses?</li>
          <li>Is this employment or a contractor arrangement, and what costs would I cover?</li>
          <li>When are salary reviews held, and what determines an increase?</li>
          <li>Which benefits are contractual, and which can change?</li>
          <li>Does relocation support include repayment conditions if I leave?</li>
          <li>Where may I work, and how often is office attendance required?</li>
        </ul>
        <p className="body-s" style={{ color: "var(--text-muted)", marginTop: 16 }}>
          Gross salary is before deductions. For tax rates and any exemptions, use the{" "}
          <a href="https://www.gov.cy/mof-tax/en/">Cyprus Tax Department</a>{" "}
          and obtain advice based on your circumstances before estimating take-home pay.
        </p>
      </div>

      <div className="cta-strip" style={{ border: "1px solid var(--accent)", borderRadius: 12, padding: "clamp(24px, 4vw, 40px)", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <h2 className="h2" style={{ marginBottom: 6 }}>Compare current opportunities</h2>
          <p className="body" style={{ color: "var(--text-muted)" }}>Browse roles and check each employer’s published pay and benefits.</p>
        </div>
        <Link href="/jobs" className="btn btn-accent btn-lg">Browse jobs</Link>
      </div>
    </div>
  );
}
