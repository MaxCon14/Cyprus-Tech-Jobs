"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { SlidersHorizontal } from "lucide-react";

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

  // Resolve initial parent/sub slugs from the URL category param
  const matchedParent = parents.find(
    p => p.slug === current.category || p.children.some(c => c.slug === current.category)
  );
  const initParentSlug = matchedParent?.slug ?? "";
  const initSubSlug    = matchedParent?.children.some(c => c.slug === current.category)
    ? (current.category ?? "") : "";

  // Local pending state — doesn't navigate until Apply is clicked
  const [parentSlug, setParentSlug] = useState(initParentSlug);
  const [subSlug,    setSubSlug]    = useState(initSubSlug);
  const [type,       setType]       = useState(current.type    ?? "");
  const [level,      setLevel]      = useState(current.level   ?? "");
  const [city,       setCity]       = useState(current.city    ?? "");
  const [salary,     setSalary]     = useState(current.salary  ?? "");

  const selectedParent = parents.find(p => p.slug === parentSlug);
  const hasChildren    = (selectedParent?.children.length ?? 0) > 0;

  // Resolved category slug to submit (sub takes precedence over parent)
  const resolvedCategory = subSlug || parentSlug || undefined;

  function apply() {
    const p = new URLSearchParams();
    if (current.search) p.set("search",   current.search);
    if (resolvedCategory) p.set("category", resolvedCategory);
    if (type)   p.set("type",   type);
    if (level)  p.set("level",  level);
    if (city)   p.set("city",   city);
    if (salary) p.set("salary", salary);
    const qs = p.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  // Count how many filters are actively set (for button label)
  const activeCount = [resolvedCategory, type, level, city, salary].filter(Boolean).length;

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
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, alignItems: "flex-start" }}>

      {/* Parent category */}
      <div style={{ minWidth: 180, flex: "1 1 180px" }}>
        <Select
          name="category-parent"
          value={parentSlug}
          placeholder="All categories"
          onChange={val => { setParentSlug(val); setSubSlug(""); }}
          options={parentOptions}
        />
      </div>

      {/* Subcategory — only when parent has children */}
      {hasChildren && selectedParent && (
        <div style={{ minWidth: 200, flex: "1 1 200px" }}>
          <Select
            name="category-sub"
            value={subSlug}
            placeholder={`All ${selectedParent.label}`}
            onChange={setSubSlug}
            options={subOptions}
          />
        </div>
      )}

      {/* Work type */}
      <div style={{ minWidth: 150, flex: "1 1 150px" }}>
        <Select
          name="type"
          value={type}
          placeholder="Work type"
          onChange={setType}
          options={REMOTE_OPTIONS}
        />
      </div>

      {/* Experience */}
      <div style={{ minWidth: 150, flex: "1 1 150px" }}>
        <Select
          name="level"
          value={level}
          placeholder="Experience"
          onChange={setLevel}
          options={EXPERIENCE_OPTIONS}
        />
      </div>

      {/* City */}
      <div style={{ minWidth: 140, flex: "1 1 140px" }}>
        <Select
          name="city"
          value={city}
          placeholder="City"
          onChange={setCity}
          options={cityOptions}
        />
      </div>

      {/* Min salary */}
      <div style={{ minWidth: 140, flex: "1 1 140px" }}>
        <Select
          name="salary"
          value={salary}
          placeholder="Min salary"
          onChange={setSalary}
          options={SALARY_OPTIONS}
        />
      </div>

      {/* Apply button */}
      <button
        type="button"
        onClick={apply}
        className="btn btn-accent"
        style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}
      >
        <SlidersHorizontal size={14} />
        Apply{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
    </div>
  );
}
