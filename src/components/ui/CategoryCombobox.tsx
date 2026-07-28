"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

/* A single searchable category picker.
 *
 * Replaces the old two-step "pick a broad category, then pick a subcategory"
 * cascade. Employers could not find the exact role without first guessing which
 * parent it lived under — "Company Secretary" is under "Legal & Corporate",
 * which is not obvious. This flattens the whole tree (parents *and* the roles
 * beneath them) into one type-to-filter list, so typing "company secretary",
 * "fincrime" or "head of product" surfaces it no matter where it sits.
 *
 * Value-agnostic: the employer forms pass slugs, the admin form passes ids.
 * Selecting a role submits that role; selecting a broad parent submits the
 * parent — both are valid category values the job APIs already accept. */

export interface CategoryComboboxTree {
  label: string;
  value: string;
  children: { label: string; value: string }[];
}

interface FlatOption {
  value:       string;
  label:       string;
  /** Present only for child roles — the broad category it belongs to. */
  parentLabel?: string;
  isParent:    boolean;
}

interface Props {
  categories:   CategoryComboboxTree[];
  value:        string;
  onChange:     (value: string) => void;
  placeholder?: string;
  error?:       boolean;
  /** Rendered on the trigger so validation scroll-to-error can find it. */
  name?:        string;
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
  placeholder = "Search a category or role…",
  error,
  name,
}: Props) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const [active, setActive] = useState(0);

  const rootRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  // Flatten the tree once: each parent, immediately followed by its roles.
  const flat = useMemo<FlatOption[]>(() => {
    const out: FlatOption[] = [];
    for (const p of categories) {
      out.push({ value: p.value, label: p.label, isParent: true });
      for (const c of p.children) {
        out.push({ value: c.value, label: c.label, parentLabel: p.label, isParent: false });
      }
    }
    return out;
  }, [categories]);

  const selected = flat.find(o => o.value === value);

  // Match against the role name and its parent, so typing a broad word
  // ("compliance", "marketing") also brings up the roles beneath it.
  const filtered = useMemo<FlatOption[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flat;
    return flat.filter(o =>
      o.label.toLowerCase().includes(q) ||
      (o.parentLabel?.toLowerCase().includes(q) ?? false)
    );
  }, [flat, query]);

  // Keep the highlighted row in range whenever the filtered set changes.
  useEffect(() => { setActive(0); }, [query]);

  // Focus the search box as soon as the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    function down(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, []);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function pick(opt: FlatOption) {
    onChange(opt.value);
    close();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(a => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[active];
      if (opt) pick(opt);
    }
  }

  // Scroll the active row into view during keyboard navigation.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const hasValue = !!selected;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      {/* Trigger — mirrors the styling of the standard Select control. */}
      <button
        type="button"
        name={name}
        onClick={() => (open ? close() : setOpen(true))}
        style={{
          width:        "100%",
          padding:      "10px 36px 10px 12px",
          font:         "400 14px/1.4 var(--font-sans)",
          color:        hasValue ? "var(--text)" : "var(--text-subtle)",
          background:   "var(--surface)",
          border:       `1px solid ${error ? "var(--error)" : open ? "var(--accent)" : "var(--border-strong)"}`,
          borderRadius: "var(--radius-sm)",
          cursor:       "pointer",
          textAlign:    "left",
          display:      "flex",
          alignItems:   "center",
          gap:          8,
          boxShadow:    open ? "0 0 0 3px var(--accent-soft)" : "none",
          transition:   "border-color 150ms, box-shadow 150ms",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected
            ? selected.parentLabel
              ? <>{selected.label} <span style={{ color: "var(--text-subtle)" }}>· {selected.parentLabel}</span></>
              : selected.label
            : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "var(--text-subtle)", flexShrink: 0, position: "absolute", right: 12,
            transition: "transform 150ms", transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 200, overflow: "hidden", minWidth: 220,
          }}
        >
          {/* Search box */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
            <Search size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type to search…"
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                font: "400 14px/1.4 var(--font-sans)", color: "var(--text)",
              }}
            />
          </div>

          {/* Results */}
          <div ref={listRef} style={{ maxHeight: 280, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div className="body-s" style={{ padding: "14px 14px", color: "var(--text-subtle)" }}>
                No matching category.
              </div>
            )}
            {filtered.map((opt, i) => {
              const isSelected = opt.value === value;
              const isActive   = i === active;
              return (
                <button
                  key={`${opt.value}-${i}`}
                  type="button"
                  data-idx={i}
                  onClick={() => pick(opt)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    width: "100%", padding: "9px 14px", border: "none", cursor: "pointer",
                    textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                    font: opt.isParent
                      ? "600 14px/1.4 var(--font-sans)"
                      : "400 14px/1.4 var(--font-sans)",
                    color:      isSelected ? "var(--accent)" : "var(--text)",
                    background: isActive ? "var(--bg-muted)" : isSelected ? "var(--accent-soft)" : "transparent",
                    transition: "background 80ms",
                  }}
                >
                  <span style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
                    {opt.parentLabel && (
                      <span className="mono-s" style={{ color: "var(--text-subtle)", flexShrink: 0 }}>· {opt.parentLabel}</span>
                    )}
                  </span>
                  {isSelected && <Check size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
