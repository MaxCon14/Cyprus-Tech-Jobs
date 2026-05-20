"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

const POPULAR = [
  "JavaScript", "TypeScript", "Python", "React", "Node.js",
  "Next.js", "Vue.js", "Go", "Java", "PHP",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "AWS",
  "Docker", "Git", "Figma", "React Native", "Flutter",
];

interface Props {
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TechStackSelector({ options, selected, onChange, placeholder }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (tag: string) => {
    if (!selected.includes(tag)) onChange([...selected, tag]);
    setQuery("");
    inputRef.current?.focus();
  };

  const remove = (tag: string) => onChange(selected.filter((t) => t !== tag));

  const atLimit = selected.length >= 10;

  const popularVisible = POPULAR.filter((s) => !selected.includes(s));

  const searchResults = query.trim().length > 0
    ? options
        .filter((o) => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 24)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      e.preventDefault();
      if (!atLimit) add(searchResults[0]);
    }
    if (e.key === "Escape") setQuery("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {selected.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 10px",
                background: "var(--accent-soft)", border: "1.5px solid var(--pink-200)",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)",
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
                style={{ display: "grid", placeItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--accent)", opacity: 0.7 }}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Popular skills */}
      {popularVisible.length > 0 && (
        <div>
          <p className="body-s" style={{ color: "var(--text-subtle)", marginBottom: 8, fontWeight: 500 }}>Popular</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {popularVisible.map((skill) => (
              <button
                key={skill}
                type="button"
                disabled={atLimit}
                onClick={() => add(skill)}
                style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "5px 12px",
                  background: "var(--surface)", border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-full)",
                  fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)",
                  cursor: atLimit ? "not-allowed" : "pointer",
                  opacity: atLimit ? 0.45 : 1,
                  transition: "border-color 120ms ease, color 120ms ease, background 120ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!atLimit) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                }}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
        <input
          ref={inputRef}
          className="input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={atLimit ? "10/10 skills — remove one to add more" : (placeholder ?? "Search all skills — e.g. Rust, Figma, dbt…")}
          disabled={atLimit}
          autoComplete="off"
          style={{ paddingLeft: 36 }}
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "grid", placeItems: "center", padding: 4 }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div>
          <p className="body-s" style={{ color: "var(--text-subtle)", marginBottom: 8, fontWeight: 500 }}>
            Results for &ldquo;{query}&rdquo;
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {searchResults.map((skill) => (
              <button
                key={skill}
                type="button"
                disabled={atLimit}
                onClick={() => add(skill)}
                style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "5px 12px",
                  background: "var(--surface)", border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-full)",
                  fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)",
                  cursor: atLimit ? "not-allowed" : "pointer",
                  opacity: atLimit ? 0.45 : 1,
                  transition: "border-color 120ms ease, color 120ms ease, background 120ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!atLimit) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                  (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                }}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {query.trim().length > 0 && searchResults.length === 0 && (
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>
          No skills match &ldquo;{query}&rdquo; — try a different term.
        </p>
      )}
    </div>
  );
}
