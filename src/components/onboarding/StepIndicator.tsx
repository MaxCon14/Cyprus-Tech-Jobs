"use client";

import { Check } from "lucide-react";

interface Props {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: Props) {
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div
      style={{
        position: "sticky",
        top: 60,
        zIndex: 30,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          height: 3,
          background: "var(--bg-muted)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${progress}%`,
            background: "var(--accent)",
            transition: "width 400ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>

      {/* Step circles + labels */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          padding: "14px 0",
        }}
      >
        {steps.map((label, i) => {
          const isComplete = i < currentStep;
          const isActive = i === currentStep;

          return (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              {/* Circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  transition: "all 200ms ease",
                  background: isComplete
                    ? "var(--black)"
                    : isActive
                      ? "var(--accent)"
                      : "transparent",
                  border: isComplete || isActive
                    ? "none"
                    : "1.5px solid var(--border-strong)",
                  color: isComplete || isActive ? "var(--white)" : "var(--text-subtle)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {isComplete ? <Check size={13} strokeWidth={2.5} /> : i + 1}
              </div>

              {/* Label */}
              <span
                className="caption"
                style={{
                  color: isActive
                    ? "var(--accent)"
                    : isComplete
                      ? "var(--text-muted)"
                      : "var(--text-subtle)",
                  transition: "color 200ms ease",
                  whiteSpace: "nowrap",
                  display: steps.length > 4 ? (isActive ? "block" : "none") : "block",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
