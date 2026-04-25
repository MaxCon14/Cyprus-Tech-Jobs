"use client";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ProfileRing({ score, size = 80, strokeWidth = 6 }: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score < 40 ? "#f59e0b" : score < 75 ? "var(--accent)" : "#22c55e";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.16,1,0.3,1), stroke 400ms ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: size * 0.21, fontWeight: 700, color, lineHeight: 1 }}>
          {score}%
        </span>
      </div>
    </div>
  );
}
