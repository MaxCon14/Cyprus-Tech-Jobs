"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { Search, SlidersHorizontal } from "lucide-react";

export type CategoryNode = {
  id: string;
  label: string;
  slug: string;
  count: number;
  children: { id: string; label: string; slug: string; count: number }[];
};

interface Props {
  categories: CategoryNode[];
  current: {
    category?: string;
    type?: string;
    level?: string;
    city?: string;
    salary?: string;
    search?: string;
  };
  cities: string[];
}

const REMOTE_OPTIONS = [
  { label: "Any work type", value: "" },
  { label: "Remote",        value: "REMOTE"  },
  { label: "Hybrid",        value: "HYBRID"  },
  { label: "On-site",       value: "ON_SITE" },
];

const EXPERIENCE_OPTIONS = [
  { label: "Any experience", value: ""          },
  { label: "Junior",         value: "JUNIOR"    },
  { label: "Mid-level",      value: "MID"       },
  { label: "Senior",         value: "SENIOR"    },
  { label: "Lead",           value: "LEAD"      },
  { label: "Executive",      value: "EXECUTIVE" },
];

const SALARY_OPTIONS = [
  { label: "Any salary", value: ""       },
  { label: "€30k+",      value: "30000"  },
  { label: "€50k+",      value: "50000"  },
  { label: "€70k+",      value: "70000"  },
  { label: "€100k+",     value: "100000" },
];

export function FilterBar({ categories, current, cities }: Props) {
  const router  = useRouter();
  const parents = categories.filter(c => c.slug !== "");

  const matchedParent = parents.find(
    p => p.slug === current.category || p.children.some(c => c.slug === current.category)
  );
  const initParentSlug = matchedParent?.slug ?? "";
  const initSubSlug    = matchedParent?.children.some(c => c.slug === current.category)
    ? (current.category ?? "") : "";

  const [search,     setSearch]     = useState(current.search  ?? "");
  const [parentSlug, setParentSlug] = useState(initParentSlug);
  const [subSlug,    setSubSlug]    = useState(initSubSlug);
  const [type,       setType]       = useState(current.type    ?? "");
  const [level,      setLevel]      = useState(current.level   ?? "");
  const [city,       setCity]       = useState(current.city    ?? "");
  const [salary,     setSalary]     = useState(current.salary  ?? "");

  const selectedParent = parents.find(p => p.slug === parentSlug);
  const hasChildren    = (selectedParent?.children.length ?? 0) > 0;
  const resolvedCategory = subSlug || parentSlug || undefined;

  const activeCount = [resolvedCategory, type, level, city, salary, search.trim() || undefined]
    .filter(Boolean).length;

  function apply() {
    const p = new URLSearchParams();
    if (search.trim())    p.set("search",   search.trim());
    if (resolvedCategory) p.set("category", resolvedCategory);
    if (type)   p.set("type",   type);
    if (level)  p.set("level",  level);
    if (city)   p.set("city",   city);
    if (salary) p.set("salary", salary);
    const qs = p.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  function clear() {
    setSearch(""); setParentSlug(""); setSubSlug("");
    setType(""); setLevel(""); setCity(""); setSalary("");
    router.push("/jobs");
  }

  const cityOptions = [
    { label: "Any city", value: "" },
    ...cities.map(c => ({ label: c, value: c })),
  ];

  const parentOptions = [
    { label: "All categories", value: "" },
    ...parents.map(p => ({ label: p.label, value: p.slug })),
  ];

  const subOptions = selectedParent ? [
    { label: `All ${selectedParent.label}`, value: "" },
    ...selectedParent.children.map(c => ({ label: c.label, value: c.slug })),
  ] : [];

  return (
    <aside style={{
      position: "sticky",
      top: 24,
      display: "flex",
      flexDirection: "column",
      gap: 0,
      border: "1px solid var(--border)",
      borderRadius: 10,
      overflow: "hidden",
      background: "var(--surface)",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg-alt)",
      }}>
        <SlidersHorizontal size={13} style={{ color: "var(--accent)" }} />
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13 }}>
          Filters
        </span>
        {activeCount > 0 && (
          <span style={{
            marginLeft: "auto",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            borderRadius: 99,
            padding: "1px 7px",
          }}>
            {activeCount}
          </span>
        )}
      </div>

      {/* Search */}
      <FilterSection title="Search">
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
          <input
            className="input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && apply()}
            placeholder="Title, company, keyword…"
            style={{ paddingLeft: 30, fontSize: 13 }}
          />
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <Select
          name="category-parent"
          value={parentSlug}
          placeholder="All categories"
          onChange={val => { setParentSlug(val); setSubSlug(""); }}
          options={parentOptions}
        />
        {hasChildren && selectedParent && (
          <div style={{ marginTop: 8 }}>
            <Select
              name="category-sub"
              value={subSlug}
              placeholder={`All ${selectedParent.label}`}
              onChange={setSubSlug}
              options={subOptions}
            />
          </div>
        )}
      </FilterSection>

      {/* Work type */}
      <FilterSection title="Work type">
        <Select name="type" value={type} placeholder="Any work type" onChange={setType} options={REMOTE_OPTIONS} />
      </FilterSection>

      {/* Experience */}
      <FilterSection title="Experience">
        <Select name="level" value={level} placeholder="Any experience" onChange={setLevel} options={EXPERIENCE_OPTIONS} />
      </FilterSection>

      {/* City */}
      <FilterSection title="City">
        <Select name="city" value={city} placeholder="Any city" onChange={setCity} options={cityOptions} />
      </FilterSection>

      {/* Min salary */}
      <FilterSection title="Min salary" last>
        <Select name="salary" value={salary} placeholder="Any salary" onChange={setSalary} options={SALARY_OPTIONS} />
      </FilterSection>

      {/* Actions */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" onClick={apply} className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>
          Apply filters
        </button>
        {activeCount > 0 && (
          <button type="button" onClick={clear} className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center" }}>
            Clear all
          </button>
        )}
      </div>
    </aside>
  );
}

function FilterSection({ title, children, last = false }: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div style={{
      padding: "14px 16px",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}>
      <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8, letterSpacing: "0.06em" }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}
