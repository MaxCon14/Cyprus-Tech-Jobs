"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

function RoleCard({
  href,
  icon,
  title,
  description,
  perks,
  cta,
  accent,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  perks: string[];
  cta: string;
  accent: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `1px solid ${hovered ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 14,
          padding: 32,
          background: "var(--surface)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          transition: "border-color 200ms, box-shadow 200ms",
          cursor: "pointer",
          boxShadow: hovered ? "0 0 0 3px var(--accent-soft)" : "none",
        }}
      >
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: accent ? "var(--accent-soft)" : "var(--bg-muted)",
          display: "grid",
          placeItems: "center",
        }}>
          {icon}
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 6 }}>
            {title}
          </div>
          <div className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
            {description}
          </div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {perks.map(perk => (
            <li key={perk} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <CheckCircle size={14} style={{ color: accent ? "var(--accent)" : "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
              <span className="body-s" style={{ color: "var(--text-muted)" }}>{perk}</span>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: accent ? "var(--accent)" : "var(--text-muted)" }}>
          {cta} <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

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

export function RoleCards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "100%", maxWidth: 760 }}>
      <RoleCard
        href="/employers/onboarding"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}
        title="I'm hiring"
        description="Post jobs and connect with the best tech talent in Cyprus."
        perks={EMPLOYER_PERKS}
        cta="Create employer account"
        accent={true}
      />
      <RoleCard
        href="/candidates/onboarding"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
        title="I'm looking for work"
        description="Get personalised job alerts for tech roles in Cyprus."
        perks={SEEKER_PERKS}
        cta="Set up job alerts"
        accent={false}
      />
    </div>
  );
}
