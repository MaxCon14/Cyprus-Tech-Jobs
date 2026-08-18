// Single source of truth for job categories.
//
// Every category selector, filter, nav menu and API validator reads from here.
// Adding a category means adding one row below — new slugs are upserted into the
// `categories` table on first job post (see api/jobs/post), so no migration is
// needed.

export type CategoryGroup = "tech" | "gaming";

export interface JobCategory {
  slug:  string;
  /** Full label — nav, filters, job pages. */
  label: string;
  /** Compact label for tight spots (chips, onboarding grids). */
  short: string;
  /** Emoji used on the homepage category grid. */
  icon:  string;
  group: CategoryGroup;
  /** Shown in the homepage category grid (kept to a tidy multiple of 4). */
  featured?: boolean;
  /** Example roles — shown as helper text under the category picker. */
  roles: string[];
}

export const JOB_CATEGORIES: JobCategory[] = [
  // ─── Tech ──────────────────────────────────────────────────────
  {
    slug: "frontend", label: "Frontend", short: "Frontend", icon: "⌨️", group: "tech", featured: true,
    roles: ["Frontend Engineer", "React Developer", "Web Developer"],
  },
  {
    slug: "backend", label: "Backend", short: "Backend", icon: "⚙️", group: "tech", featured: true,
    roles: ["Backend Engineer", "API Developer", "Platform Engineer"],
  },
  {
    slug: "full-stack", label: "Full Stack", short: "Full Stack", icon: "🧩", group: "tech",
    roles: ["Full Stack Engineer", "Web Engineer"],
  },
  {
    slug: "devops", label: "DevOps & Cloud", short: "DevOps", icon: "☁️", group: "tech", featured: true,
    roles: ["DevOps Engineer", "SRE", "Cloud Architect"],
  },
  {
    slug: "design", label: "UI/UX Design", short: "Design", icon: "🎨", group: "tech", featured: true,
    roles: ["Product Designer", "UX Designer", "UI Designer"],
  },
  {
    slug: "data", label: "Data & Analytics", short: "Data", icon: "📊", group: "tech", featured: true,
    roles: ["Data Engineer", "Data Scientist", "Analytics Engineer"],
  },
  {
    slug: "mobile", label: "Mobile", short: "Mobile", icon: "📱", group: "tech", featured: true,
    roles: ["iOS Engineer", "Android Engineer", "React Native Developer"],
  },
  {
    slug: "product", label: "Product", short: "Product", icon: "🗂️", group: "tech", featured: true,
    roles: ["Product Manager", "Product Owner", "Technical Program Manager"],
  },
  {
    slug: "security", label: "Security", short: "Security", icon: "🔐", group: "tech", featured: true,
    roles: ["Security Engineer", "Penetration Tester", "SOC Analyst"],
  },
  {
    slug: "qa", label: "QA & Testing", short: "QA", icon: "🧪", group: "tech",
    roles: ["QA Engineer", "Automation Engineer", "Test Analyst"],
  },

  // ─── Gaming ────────────────────────────────────────────────────
  {
    slug: "game-art", label: "Game Art & 3D", short: "Game Art", icon: "🧊", group: "gaming", featured: true,
    roles: [
      "3D Artist", "3D Character Artist", "3D Environment Artist", "Prop Artist",
      "Technical Artist", "Animator", "Rigging Artist", "Concept Artist",
      "VFX Artist", "2D Artist", "UI Artist", "Art Director",
    ],
  },
  {
    slug: "game-design", label: "Game Design", short: "Game Design", icon: "🕹️", group: "gaming", featured: true,
    roles: [
      "Game Designer", "Level Designer", "Systems Designer", "Combat Designer",
      "Narrative Designer", "Game Writer", "UX Designer (Games)",
    ],
  },
  {
    slug: "game-programming", label: "Game Programming", short: "Game Dev", icon: "🎮", group: "gaming", featured: true,
    roles: [
      "Unity Developer", "Unreal Developer", "Gameplay Programmer",
      "Engine Programmer", "Graphics Programmer", "Game Backend Engineer",
      "Tools Programmer",
    ],
  },
  {
    slug: "game-economy", label: "Game Economy & LiveOps", short: "Game Economy", icon: "💰", group: "gaming", featured: true,
    roles: [
      "Game Economy Designer", "Monetisation Manager", "LiveOps Manager",
      "Game Analyst", "Player Progression Designer", "Game Product Manager",
    ],
  },
];

export const TECH_CATEGORIES     = JOB_CATEGORIES.filter(c => c.group === "tech");
export const FEATURED_CATEGORIES = JOB_CATEGORIES.filter(c => c.featured);
export const GAMING_CATEGORIES   = JOB_CATEGORIES.filter(c => c.group === "gaming");

/** slug → full label, for API validation and label lookups. */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  JOB_CATEGORIES.map(c => [c.slug, c.label]),
);

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug;
}

export function isCategorySlug(slug: string): boolean {
  return slug in CATEGORY_LABELS;
}

export const GROUP_LABELS: Record<CategoryGroup, string> = {
  tech:   "Tech & Product",
  gaming: "Gaming",
};

/** Options for the shared <Select> component, grouped by discipline. */
export const CATEGORY_SELECT_OPTIONS = JOB_CATEGORIES.map(c => ({
  label: c.label,
  value: c.slug,
  group: GROUP_LABELS[c.group],
}));

/** Example roles for a category — helper text under the category picker. */
export function categoryRoleHint(slug: string): string | null {
  const cat = JOB_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return null;
  return `e.g. ${cat.roles.slice(0, 4).join(", ")}`;
}
