"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export function FiltersPanel({
  activeCount,
  children,
}: {
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside>
      {/* Toggle button — only visible on mobile */}
      <button
        className="filters-mobile-toggle"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <SlidersHorizontal size={14} />
        <span>
          Filters{activeCount > 0 ? ` · ${activeCount} active` : ""}
        </span>
        <ChevronDown
          size={14}
          className={`nav-chevron${open ? " open" : ""}`}
          style={{ marginLeft: "auto" }}
        />
      </button>

      {/* Panel body — always visible on desktop, toggled on mobile */}
      <div className={`filters-panel-body${open ? " open" : ""}`}>
        {children}
      </div>
    </aside>
  );
}
