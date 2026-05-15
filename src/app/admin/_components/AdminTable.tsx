import type { ReactNode } from "react";

export function AdminTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--bg-muted)" }}>
            {columns.map(col => (
              <th key={col} style={{
                textAlign: "left", padding: "10px 14px", fontWeight: 600,
                color: "var(--text-subtle)", fontSize: 10, letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}>
                {col.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminTr({ children }: { children: ReactNode }) {
  return <tr style={{ borderTop: "1px solid var(--border)" }}>{children}</tr>;
}

export function AdminTd({ children, subtle, mono, right }: {
  children: ReactNode; subtle?: boolean; mono?: boolean; right?: boolean;
}) {
  return (
    <td style={{
      padding: "10px 14px", verticalAlign: "middle",
      color: subtle ? "var(--text-subtle)" : "var(--text)",
      fontFamily: mono ? "var(--font-mono)" : undefined,
      fontSize: mono ? 12 : undefined,
      textAlign: right ? "right" : undefined,
    }}>
      {children}
    </td>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    ACTIVE:      { color: "var(--success)", bg: "var(--success-bg, #f0fdf4)" },
    DRAFT:       { color: "var(--text-subtle)", bg: "var(--bg-muted)" },
    EXPIRED:     { color: "var(--warning)", bg: "var(--warning-bg)" },
    PAUSED:      { color: "var(--info)", bg: "var(--info-bg, #eff6ff)" },
    CLOSED:      { color: "#ef4444", bg: "#fef2f2" },
    LIVE:        { color: "var(--success)", bg: "var(--success-bg, #f0fdf4)" },
    BLOCKED:     { color: "#ef4444", bg: "#fef2f2" },
    VERIFIED:    { color: "var(--success)", bg: "var(--success-bg, #f0fdf4)" },
    UNVERIFIED:  { color: "var(--text-subtle)", bg: "var(--bg-muted)" },
    FEATURED:    { color: "var(--accent)", bg: "var(--accent-soft)" },
  };
  const s = map[status] ?? { color: "var(--text-subtle)", bg: "var(--bg-muted)" };
  return (
    <span style={{
      display: "inline-block", fontFamily: "var(--font-mono)", fontSize: 10,
      fontWeight: 700, padding: "2px 7px", borderRadius: 4,
      color: s.color, background: s.bg,
    }}>
      {status}
    </span>
  );
}
