"use client";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface Props {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

export function AdminSearchInput({ placeholder, value, onChange }: Props) {
  return (
    <div style={{ position: "relative", width: 280 }}>
      <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          fontFamily: "var(--font-sans)", fontSize: 13,
          padding: "7px 32px 7px 30px",
          border: "1px solid var(--border)", borderRadius: 8,
          background: "var(--surface)", color: "var(--text)",
          outline: "none",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "grid", placeItems: "center", padding: 2 }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
