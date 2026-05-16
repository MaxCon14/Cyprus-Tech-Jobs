"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";

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
  const router = useRouter();
  const parents = categories.filter(c => c.slug !== ""); // exclude "All jobs" pseudo-entry

  // Decode which parent and subcategory are active from the URL
  const currentCat = current.category ?? "";
  const matchedParent = parents.find(
    p => p.slug === currentCat || p.children.some(c => c.slug === currentCat)
  );
  const parentSlug = matchedParent?.slug ?? "";
  const subSlug    = matchedParent?.children.some(c => c.slug === currentCat) ? currentCat : "";
  const selectedParent = parents.find(p => p.slug === parentSlug);
  const hasChildren    = (selectedParent?.children.length ?? 0) > 0;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      search:   current.search,
      category: current.category,
      type:     current.type,
      city:     current.city,
      level:    current.level,
      salary:   current.salary,
    };
    const merged = { ...base, ...overrides, page: undefined };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    const qs = p.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
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
    { label: `All ${selectedParent.label}`, value: parentSlug },
    ...selectedParent.children.map(c => ({ label: c.label, value: c.slug })),
  ] : [];

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, alignItems: "flex-start",
    }}>
      {/* Parent category */}
      <div style={{ minWidth: 180, flex: "1 1 180px" }}>
        <Select
          name="category-parent"
          value={parentSlug}
          placeholder="All categories"
          onChange={val => router.push(buildUrl({ category: val || undefined }))}
          options={parentOptions}
        />
      </div>

      {/* Subcategory — only when parent has children */}
      {hasChildren && selectedParent && (
        <div style={{ minWidth: 200, flex: "1 1 200px" }}>
          <Select
            name="category-sub"
            value={subSlug || parentSlug}
            onChange={val => router.push(buildUrl({ category: val || undefined }))}
            options={subOptions}
          />
        </div>
      )}

      {/* Work type */}
      <div style={{ minWidth: 150, flex: "1 1 150px" }}>
        <Select
          name="type"
          value={current.type ?? ""}
          placeholder="Work type"
          onChange={val => router.push(buildUrl({ type: val || undefined }))}
          options={REMOTE_OPTIONS}
        />
      </div>

      {/* Experience */}
      <div style={{ minWidth: 150, flex: "1 1 150px" }}>
        <Select
          name="level"
          value={current.level ?? ""}
          placeholder="Experience"
          onChange={val => router.push(buildUrl({ level: val || undefined }))}
          options={EXPERIENCE_OPTIONS}
        />
      </div>

      {/* City */}
      <div style={{ minWidth: 140, flex: "1 1 140px" }}>
        <Select
          name="city"
          value={current.city ?? ""}
          placeholder="City"
          onChange={val => router.push(buildUrl({ city: val || undefined }))}
          options={cityOptions}
        />
      </div>

      {/* Min salary */}
      <div style={{ minWidth: 140, flex: "1 1 140px" }}>
        <Select
          name="salary"
          value={current.salary ?? ""}
          placeholder="Min salary"
          onChange={val => router.push(buildUrl({ salary: val || undefined }))}
          options={SALARY_OPTIONS}
        />
      </div>
    </div>
  );
}
