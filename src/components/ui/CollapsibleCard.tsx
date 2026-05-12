"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function CollapsibleCard({
  title,
  icon,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon?: React.ReactNode;
  badge?: number | null;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
          borderBottom: open ? "1px solid var(--border)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ color: "var(--accent)", display: "flex" }}>{icon}</span>}
          <span className="body-s" style={{ fontWeight: 700, color: "var(--text)" }}>{title}</span>
          {badge != null && badge > 0 && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)",
              background: "var(--accent-soft)", padding: "2px 7px", borderRadius: 99,
            }}>
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          style={{
            color: "var(--text-subtle)", flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 200ms ease",
          }}
        />
      </button>

      {open && (
        <div style={{ padding: "12px 20px 16px" }}>
          {children}
        </div>
      )}
    </div>
  );
}
