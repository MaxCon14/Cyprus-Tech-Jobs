import type { Metadata } from "next";
import { PostJobForm } from "./PostJobForm";

export const metadata: Metadata = {
  title: "Post a Job — Hire Tech Talent in Cyprus",
  description: "Post a tech job in Cyprus and reach thousands of active candidates. Listings go live within minutes.",
};

export default function PostAJobPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "clamp(40px, 6vw, 64px) var(--page-padding-x) clamp(36px, 5vw, 56px)", background: "var(--bg-alt)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            FOR EMPLOYERS · CYPRUSTECHJOBS
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
        <PostJobForm />
      </div>
    </div>
  );
}
