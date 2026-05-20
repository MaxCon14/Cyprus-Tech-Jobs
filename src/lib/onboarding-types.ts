// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYER WIZARD
// ─────────────────────────────────────────────────────────────────────────────

export type EmployerWizardStep = 1 | 2 | 3 | 4 | 5;
export type WizardDirection = "forward" | "backward";

export interface EmployerWizardState {
  step: EmployerWizardStep;
  direction: WizardDirection;
  submitting: boolean;
  employerId: string | null;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  // Step 1
  name: string;
  email: string;
  // Step 2
  companyName: string;
  website: string;
  city: string;
  size: "startup" | "scaleup" | "enterprise" | "agency" | "";
  // Step 3
  description: string;
  techStack: string[];
  logoUrl: string;
}

export type EmployerWizardAction =
  | { type: "SET_FIELD"; field: string; value: string | string[] }
  | { type: "BLUR_FIELD"; field: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SET_EMPLOYER_ID"; id: string }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "RESET" };

export function initialEmployerState(): EmployerWizardState {
  return {
    step: 1,
    direction: "forward",
    submitting: false,
    employerId: null,
    errors: {},
    touched: {},
    name: "",
    email: "",
    companyName: "",
    website: "",
    city: "",
    size: "",
    description: "",
    techStack: [],
    logoUrl: "",
  };
}

export function validateEmployerStep(
  step: EmployerWizardStep,
  state: EmployerWizardState,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 1) {
    if (!state.name.trim()) errors.name = "Your name is required.";
    if (!state.email.trim()) {
      errors.email = "Work email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      errors.email = "Enter a valid email address.";
    }
  }
  if (step === 2) {
    if (!state.companyName.trim()) errors.companyName = "Company name is required.";
    if (state.website && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(state.website)) {
      errors.website = "Enter a valid domain (e.g. example.com).";
    }
  }
  if (step === 3) {
    if (state.description.trim().length > 0 && state.description.trim().length < 40) {
      errors.description = "Add a bit more — at least 40 characters.";
    }
  }
  return errors;
}

export function employerReducer(
  state: EmployerWizardState,
  action: EmployerWizardAction,
): EmployerWizardState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "BLUR_FIELD": {
      const touched = { ...state.touched, [action.field]: true };
      const stepErrors = validateEmployerStep(state.step, state);
      const errors = { ...state.errors };
      if (stepErrors[action.field]) {
        errors[action.field] = stepErrors[action.field];
      } else {
        delete errors[action.field];
      }
      return { ...state, touched, errors };
    }

    case "NEXT_STEP": {
      const stepErrors = validateEmployerStep(state.step, state);
      if (Object.keys(stepErrors).length > 0) {
        const allTouched = Object.fromEntries(
          Object.keys(stepErrors).map((k) => [k, true]),
        );
        return { ...state, errors: stepErrors, touched: { ...state.touched, ...allTouched } };
      }
      const next = Math.min(state.step + 1, 5) as EmployerWizardStep;
      return { ...state, step: next, direction: "forward", errors: {} };
    }

    case "PREV_STEP": {
      const prev = Math.max(state.step - 1, 1) as EmployerWizardStep;
      return { ...state, step: prev, direction: "backward", errors: {} };
    }

    case "SET_SUBMITTING":
      return { ...state, submitting: action.value };

    case "SET_EMPLOYER_ID":
      return { ...state, employerId: action.id };

    case "SET_ERRORS":
      return { ...state, errors: action.errors };

    case "RESET":
      return initialEmployerState();

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE WIZARD
// ─────────────────────────────────────────────────────────────────────────────

export type CandidateWizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface PositionDraft {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CandidateWizardState {
  step: CandidateWizardStep;
  direction: WizardDirection;
  submitting: boolean;
  candidateId: string | null;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  // Step 2 — work type
  categories: string[];
  remoteType: "REMOTE" | "HYBRID" | "ON_SITE" | "";
  // Step 3 — location
  city: string;
  // Step 4 — level
  experienceLevel: "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE" | "";
  salaryMin: string;
  // Step 5 — skills (skippable, max 10)
  skills: string[];
  // Step 6 — alerts
  alertFrequency: "DAILY" | "WEEKLY";
  // Step 7 — profile / account
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  dribbbleUrl: string;
  behanceUrl: string;
  twitterUrl: string;
  mediumUrl: string;
  cvUrl: string;
  // Step 8 — work experience
  positions: PositionDraft[];
}

export type CandidateWizardAction =
  | { type: "SET_FIELD"; field: string; value: string | string[] }
  | { type: "TOGGLE_CATEGORY"; slug: string }
  | { type: "BLUR_FIELD"; field: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SET_CANDIDATE_ID"; id: string }
  | { type: "SET_POSITIONS"; value: PositionDraft[] }
  | { type: "RESET" };

export function initialCandidateState(): CandidateWizardState {
  return {
    step: 1,
    direction: "forward",
    submitting: false,
    candidateId: null,
    errors: {},
    touched: {},
    categories: [],
    remoteType: "",
    city: "",
    experienceLevel: "",
    salaryMin: "",
    skills: [],
    alertFrequency: "WEEKLY",
    firstName: "",
    lastName: "",
    email: "",
    headline: "",
    bio: "",
    avatarUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    dribbbleUrl: "",
    behanceUrl: "",
    twitterUrl: "",
    mediumUrl: "",
    cvUrl: "",
    positions: [],
  };
}

export function validateCandidateStep(
  step: CandidateWizardStep,
  state: CandidateWizardState,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 6) {
    if (!state.firstName.trim()) errors.firstName = "First name is required.";
    if (!state.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      errors.email = "Enter a valid email address.";
    }
  }
  return errors;
}

export function candidateReducer(
  state: CandidateWizardState,
  action: CandidateWizardAction,
): CandidateWizardState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "TOGGLE_CATEGORY": {
      const cats = state.categories.includes(action.slug)
        ? state.categories.filter((c) => c !== action.slug)
        : [...state.categories, action.slug];
      return { ...state, categories: cats };
    }

    case "BLUR_FIELD": {
      const touched = { ...state.touched, [action.field]: true };
      const stepErrors = validateCandidateStep(state.step, state);
      const errors = { ...state.errors };
      if (stepErrors[action.field]) {
        errors[action.field] = stepErrors[action.field];
      } else {
        delete errors[action.field];
      }
      return { ...state, touched, errors };
    }

    case "NEXT_STEP": {
      const stepErrors = validateCandidateStep(state.step, state);
      if (Object.keys(stepErrors).length > 0) {
        const allTouched = Object.fromEntries(
          Object.keys(stepErrors).map((k) => [k, true]),
        );
        return { ...state, errors: stepErrors, touched: { ...state.touched, ...allTouched } };
      }
      const next = Math.min(state.step + 1, 8) as CandidateWizardStep;
      return { ...state, step: next, direction: "forward", errors: {} };
    }

    case "PREV_STEP": {
      const prev = Math.max(state.step - 1, 1) as CandidateWizardStep;
      return { ...state, step: prev, direction: "backward", errors: {} };
    }

    case "SET_SUBMITTING":
      return { ...state, submitting: action.value };

    case "SET_CANDIDATE_ID":
      return { ...state, candidateId: action.id };

    case "SET_POSITIONS":
      return { ...state, positions: action.value };

    case "RESET":
      return initialCandidateState();

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE COMPLETION SCORE
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileData {
  emailVerified: boolean;
  description: string;
  techStack: string[];
  website: string;
  logoUrl: string;
  hasPostedJob: boolean;
}

export interface ScoredItem {
  label: string;
  description: string;
  points: number;
  achieved: boolean;
}

export function computeProfileScore(data: ProfileData): {
  score: number;
  breakdown: ScoredItem[];
} {
  const breakdown: ScoredItem[] = [
    {
      label: "Verified email",
      description: "Confirm your work email address",
      points: 25,
      achieved: data.emailVerified,
    },
    {
      label: "Company description",
      description: "Write at least 80 characters about your company",
      points: 20,
      achieved: data.description.trim().length >= 80,
    },
    {
      label: "Tech stack",
      description: "Add 3 or more technologies your team uses",
      points: 20,
      achieved: data.techStack.length >= 3,
    },
    {
      label: "Website",
      description: "Link to your company website",
      points: 15,
      achieved: !!data.website,
    },
    {
      label: "Company logo",
      description: "Upload your company logo",
      points: 10,
      achieved: !!data.logoUrl,
    },
    {
      label: "First job posted",
      description: "Publish your first job listing",
      points: 10,
      achieved: data.hasPostedJob,
    },
  ];
  const score = breakdown.reduce((sum, item) => sum + (item.achieved ? item.points : 0), 0);
  return { score, breakdown };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const EMPLOYER_STEPS = ["Account", "Company", "Profile", "Verify email", "Done"];
export const CANDIDATE_STEPS = ["Welcome", "Work type", "Location", "Level", "Skills", "Profile", "Experience", "Done"];

export const COMPANY_SIZES = [
  { value: "startup",    label: "Startup",    description: "1–50 people" },
  { value: "scaleup",   label: "Scale-up",   description: "51–250 people" },
  { value: "enterprise",label: "Enterprise", description: "251–1,000+ people" },
  { value: "agency",    label: "Agency",     description: "Dev / design studio" },
] as const;

export const TECH_STACK_OPTIONS = [
  // Languages
  "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "Kotlin", "Swift",
  "C#", "C++", "PHP", "Ruby", "Scala", "Elixir", "Dart", "R", "Bash", "Lua",
  "Haskell", "Clojure", "Groovy", "Objective-C", "MATLAB", "Solidity",
  "HTML", "CSS",

  // Frontend frameworks & libraries
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit",
  "Astro", "Remix", "Gatsby", "Ember.js", "Alpine.js", "Lit", "Qwik",
  "Redux", "Zustand", "MobX",

  // Styling & UI
  "Tailwind CSS", "SCSS/Sass", "CSS Modules", "styled-components", "Emotion",
  "Bootstrap", "Material UI", "Chakra UI", "shadcn/ui", "Radix UI", "Ant Design",
  "Framer Motion", "Three.js", "WebGL", "D3.js", "Chart.js",

  // Build tools
  "Vite", "Webpack", "esbuild", "Turbopack", "Rollup", "Parcel",

  // Backend frameworks
  "Node.js", "Express", "NestJS", "Fastify", "Hono", "Bun", "Deno",
  "FastAPI", "Django", "Flask", "Rails", "Laravel", "Symfony",
  "Spring Boot", "Quarkus", "Micronaut", "Ktor",
  "Gin", "Echo", "Fiber", "Actix", "Axum",

  // API & data fetching
  "GraphQL", "tRPC", "REST API", "gRPC", "WebSockets", "OpenAPI", "Swagger",

  // Databases & ORMs
  "PostgreSQL", "MySQL", "SQLite", "MariaDB",
  "MongoDB", "Redis", "Elasticsearch", "Cassandra",
  "DynamoDB", "Firestore", "CockroachDB", "ClickHouse",
  "BigQuery", "Snowflake", "Redshift",
  "Prisma", "DrizzleORM", "SQLAlchemy", "Hibernate", "TypeORM",
  "Supabase", "Firebase", "PlanetScale", "Neon",

  // Cloud & infrastructure
  "AWS", "GCP", "Azure", "Cloudflare",
  "Vercel", "Netlify", "Railway", "Fly.io", "DigitalOcean", "Heroku",
  "Linux", "Nginx",

  // DevOps & containers
  "Docker", "Kubernetes", "Terraform", "Ansible", "Helm", "ArgoCD",
  "GitHub Actions", "GitLab CI", "CircleCI", "Jenkins", "Bitbucket Pipelines",

  // Observability
  "Datadog", "Grafana", "Prometheus", "Sentry", "New Relic", "OpenTelemetry",

  // Messaging & streaming
  "Kafka", "RabbitMQ", "NATS", "Redis Pub/Sub", "SQS",

  // Mobile
  "React Native", "Flutter", "Expo", "iOS", "Android",

  // Testing
  "Jest", "Vitest", "Playwright", "Cypress", "Selenium", "pytest",
  "JUnit", "Mocha", "Testing Library", "Storybook", "k6",

  // AI & data science
  "TensorFlow", "PyTorch", "scikit-learn", "Keras", "Hugging Face",
  "LangChain", "OpenAI API", "pandas", "NumPy", "Jupyter",
  "Apache Spark", "Airflow", "dbt", "MLflow",

  // Design & Creative — Adobe suite
  "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Adobe After Effects",
  "Adobe Premiere Pro", "Adobe Lightroom", "Adobe XD", "Adobe Audition", "Adobe Animate",
  "Adobe Dimension", "Adobe Acrobat", "Adobe Dreamweaver",

  // Design & Creative — Affinity suite
  "Affinity Designer", "Affinity Photo", "Affinity Publisher",

  // Design & Creative — Other tools
  "Figma", "Sketch", "Framer", "Webflow", "InVision", "Zeplin", "Marvel", "Canva",

  // 3D, Motion & Game
  "Blender", "Cinema 4D", "Unity", "Unreal Engine", "DaVinci Resolve", "Spline",

  // Marketing & SEO
  "Google Analytics", "Google Ads", "HubSpot", "Mailchimp", "Mixpanel", "Amplitude",
  "Hotjar", "WordPress", "Shopify", "WooCommerce",

  // Productivity & Collaboration
  "Notion", "Slack", "Linear", "Jira", "Confluence", "Asana", "Trello", "Monday.com",
  "Microsoft Office", "Google Workspace",

  // Dev tools & editors
  "VS Code", "IntelliJ", "Vim", "Xcode", "Android Studio", "Insomnia", "Postman",
  "Git", "GitHub", "GitLab", "Bitbucket",
  "Gradle", "Maven",

  // Security
  "Penetration Testing", "OWASP", "Burp Suite", "SIEM", "ISO 27001", "SOC 2",

  // Payments & integrations
  "Stripe", "Twilio", "SendGrid", "Auth0", "Clerk",

  // Product & methodology
  "Agile/Scrum", "Kanban", "Product Management", "UX Research",
  "A/B Testing", "SEO",
];

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "JUNIOR",    label: "Junior",    description: "0–2 years" },
  { value: "MID",       label: "Mid-level", description: "2–5 years" },
  { value: "SENIOR",    label: "Senior",    description: "5–8 years" },
  { value: "LEAD",      label: "Lead",      description: "8+ years" },
  { value: "EXECUTIVE", label: "Executive", description: "VP / Director / C-suite" },
] as const;

export const CATEGORY_OPTIONS = [
  { label: "Frontend",  slug: "frontend" },
  { label: "Backend",   slug: "backend" },
  { label: "DevOps",    slug: "devops" },
  { label: "Design",    slug: "design" },
  { label: "Data",      slug: "data" },
  { label: "Mobile",    slug: "mobile" },
  { label: "Product",   slug: "product" },
  { label: "Security",  slug: "security" },
  { label: "QA",        slug: "qa" },
];
