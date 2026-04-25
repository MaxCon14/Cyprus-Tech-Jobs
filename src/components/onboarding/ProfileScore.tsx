"use client";

import { useEffect, useState } from "react";
import { Check, Minus } from "lucide-react";
import type { ScoredItem } from "@/lib/onboarding-types";

interface Props {
  score: number;
  breakdown: ScoredItem[];
  size?: number;
}

export function ProfileScore({ score, breakdown, size = 120 }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedScore(score));
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const r = 42;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - animatedScore / 100);

  const ringColor =
    animatedScore < 40
      ? "var(--error)"
      : animatedScore < 70
        ? "var(--warning)"
        : "var(--success)";

  const scoreLabel =
    score < 40 ? "Getting started" : score < 70 ? "Looking good" : score < 100 ? "Almost there" : "Complete";

  return (
    <div>
      {/* Ring */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          role="img"
          aria-label={`Profile completion: ${score}%`}
          style={{ flexShrink: 0 }}
        >
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--bg-muted)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 50 50)"
            style={{
              transition:
                "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1), stroke 300ms ease",
            }}
          />
          {/* Score text */}
          <text
            x="50"
            y="46"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            fontWeight="700"
            fill="var(--text)"
            fontFamily="var(--font-sans)"
          >
            {score}%
          </text>
          <text
            x="50"
            y="62"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="var(--text-subtle)"
            fontFamily="var(--font-mono)"
          >
            COMPLETE
          </text>
        </svg>

        <div>
          <div
            className="h3"
            style={{ marginBottom: 4, color: ringColor, transition: "color 300ms ease" }}
          >
            {scoreLabel}
          </div>
          <p className="body-s" style={{ color: "var(--text-muted)" }}>
            {score < 100
              ? `Add ${100 - score} more points to complete your profile.`
              : "Your profile is fully set up!"}
          </p>
        </div>
      </div>

      {/* Breakdown checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {breakdown.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: item.achieved ? "var(--surface)" : "transparent",
              border: `1px solid ${item.achieved ? "var(--border)" : "transparent"}`,
              opacity: item.achieved ? 1 : 0.55,
              transition: "all 200ms ease",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                background: item.achieved ? "var(--success)" : "var(--bg-muted)",
                color: item.achieved ? "var(--white)" : "var(--text-subtle)",
                transition: "background 200ms ease",
              }}
            >
              {item.achieved ? <Check size={11} strokeWidth={2.5} /> : <Minus size={10} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="body-s" style={{ fontWeight: 500, color: "var(--text)" }}>
                {item.label}
              </div>
              <div className="mono-s" style={{ color: "var(--text-subtle)" }}>
                {item.description}
              </div>
            </div>
            <span
              className="mono-s"
              style={{
                color: item.achieved ? "var(--success)" : "var(--text-subtle)",
                fontWeight: 600,
              }}
            >
              +{item.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
