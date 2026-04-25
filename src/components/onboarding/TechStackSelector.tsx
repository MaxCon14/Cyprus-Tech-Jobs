"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TechStackSelector({
  options,
  selected,
  onChange,
  placeholder = "Search technologies…",
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options
    .filter(
      (o) =>
        !selected.includes(o) &&
        o.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 12);

  const add = (tag: string) => {
    onChange([...selected, tag]);
    setQuery("");
  };

  const remove = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      add(filtered[0]);
    }
    if (e.key === "Escape") {
      setQuery("");
      setOpen(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {selected.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                background: "var(--accent-soft)",
                border: "1px solid var(--pink-200)",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--accent)",
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
                style={{
                  display: "grid",
                  placeItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "var(--accent)",
                  opacity: 0.7,
                }}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <input
        className="input"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={selected.length === 0 ? placeholder : "Add more…"}
        role="combobox"
        aria-expanded={open && filtered.length > 0}
        aria-haspopup="listbox"
        aria-label="Search technologies"
        autoComplete="off"
      />

      {/* Dropdown */}
      {open && (query.length > 0 || selected.length === 0) && filtered.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            maxHeight: 240,
            overflowY: "auto",
            zIndex: 50,
            padding: 6,
            listStyle: "none",
            margin: 0,
          }}
        >
          {filtered.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                add(opt);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                cursor: "pointer",
                color: "var(--text)",
                transition: "background 120ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {/* Empty-state hint when no query */}
      {query.length === 0 && selected.length === 0 && (
        <p
          className="body-s"
          style={{ color: "var(--text-subtle)", marginTop: 8 }}
        >
          Type to search — e.g. React, PostgreSQL, Go
        </p>
      )}
    </div>
  );
}
