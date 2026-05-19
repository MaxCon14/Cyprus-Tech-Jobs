"use client";

import { useState, useMemo } from "react";
import { X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { getIconSrc } from "@/components/jobs/SkillTag";

const DEFAULT_VISIBLE = 30; // ~3 rows at typical tag widths

interface Props {
  name:             string;
  allTags:          string[];
  initialSelected?: string[];
  showAll?:         boolean; // admin: skip the expand/collapse entirely
}

function TagIcon({ name, white = false }: { name: string; white?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = getIconSrc(name);
  if (!src || failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={12}
      height={12}
      style={{
        width: 12, height: 12, objectFit: "contain", flexShrink: 0,
        ...(white ? { filter: "brightness(0) invert(1)" } : {}),
      }}
      onError={() => setFailed(true)}
    />
  );
}

export function SkillTagSelector({ name, allTags, initialSelected = [], showAll = false }: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return allTags;
    const q = search.toLowerCase();
    return allTags.filter(t => t.toLowerCase().includes(q));
  }, [search, allTags]);

  const isSearching    = search.trim().length > 0;
  const showExpandBtn  = !showAll && !isSearching && !expanded && filtered.length > DEFAULT_VISIBLE;
  const visibleTags    = showAll || isSearching || expanded
    ? filtered
    : filtered.slice(0, DEFAULT_VISIBLE);
  const hiddenCount    = filtered.length - DEFAULT_VISIBLE;

  function toggle(tag: string) {
    setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {selected.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 12px", borderRadius: 99,
                background: "var(--accent)", color: "var(--white)",
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer",
              }}
            >
              <TagIcon name={tag} white />
              {tag}
              <X size={10} />
            </button>
          ))}
        </div>
      )}

      {/* Search input */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={13} style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", pointerEvents: "none",
        }} />
        <input
          type="text"
          placeholder="Search skills…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "8px 12px 8px 32px", boxSizing: "border-box",
            border: "1px solid var(--border)", borderRadius: 8,
            background: "var(--bg)", color: "var(--text)",
            fontFamily: "var(--font-sans)", fontSize: 13, outline: "none",
          }}
        />
      </div>

      {/* Tag cloud */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {visibleTags.map(tag => {
          const sel = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 99,
                background: sel ? "var(--accent-soft)" : "var(--bg-muted)",
                color:      sel ? "var(--accent)"      : "var(--text-muted)",
                border:     `1px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: sel ? 600 : 400,
                cursor: "pointer", transition: "background 100ms, border-color 100ms",
              }}
            >
              <TagIcon name={tag} />
              {tag}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="body-s" style={{ color: "var(--text-muted)", marginTop: 4 }}>
            No matching skills found.
          </p>
        )}
      </div>

      {/* Show more / less toggle */}
      {showExpandBtn && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--accent)",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <ChevronDown size={13} /> Show {hiddenCount} more skills
        </button>
      )}
      {expanded && !showAll && !isSearching && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          style={{
            marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-muted)",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <ChevronUp size={13} /> Show less
        </button>
      )}

      {/* Hidden input carries selected tags as JSON */}
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
    </div>
  );
}
