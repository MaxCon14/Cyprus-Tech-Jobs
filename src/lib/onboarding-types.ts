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

export interface CandidateWizardState {
  step: CandidateWizardStep;
  direction: WizardDirection;
  submitting: boolean;
  candidateId: string | null;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  // Step 1
  categories: string[];
  remoteType: "REMOTE" | "HYBRID" | "ON_SITE" | "";
  // Step 2
  city: string;
  // Step 3
  experienceLevel: "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE" | "";
  salaryMin: string;
  // Step 4
  alertFrequency: "DAILY" | "WEEKLY";
  // Step 5 — skills
  skills: string[];
  // Step 6 — profile
  firstName: string;
  lastName: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  cvUrl: string;
}

export type CandidateWizardAction =
  | { type: "SET_FIELD"; field: string; value: string | string[] }
  | { type: "TOGGLE_CATEGORY"; slug: string }
  | { type: "BLUR_FIELD"; field: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SET_CANDIDATE_ID"; id: string }
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
    alertFrequency: "WEEKLY",
    skills: [],
    firstName: "",
    lastName: "",
    email: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    cvUrl: "",
  };
}

export function validateCandidateStep(
  step: CandidateWizardStep,
  state: CandidateWizardState,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 5) {
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
export const CANDIDATE_STEPS = ["Work type", "Location", "Your level", "Alerts", "Skills", "Your profile", "Experience", "Done"];

export const COMPANY_SIZES = [
  { value: "startup",    label: "Startup",    description: "1–50 people" },
  { value: "scaleup",   label: "Scale-up",   description: "51–250 people" },
  { value: "enterprise",label: "Enterprise", description: "251–1,000+ people" },
  { value: "agency",    label: "Agency",     description: "Dev / design studio" },
] as const;

export const TECH_STACK_OPTIONS = [
  // Languages
  "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "Kotlin", "Swift",
  "C#", "C++", "PHP", "Ruby", "Scala", "Elixir", "Dart",
  // Frontend
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "Tailwind CSS",
  "GraphQL", "tRPC", "Webpack", "Vite",
  // Backend
  "Node.js", "Express", "NestJS", "FastAPI", "Django", "Rails", "Spring Boot",
  "Gin", "Echo", "Fiber",
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra",
  "DynamoDB", "Supabase", "PlanetScale", "Prisma",
  // Cloud & DevOps
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible",
  "GitHub Actions", "CircleCI", "Jenkins", "Datadog", "Grafana",
  // Mobile
  "React Native", "Flutter", "iOS", "Android",
  // Other
  "gRPC", "Kafka", "RabbitMQ", "WebSockets", "Stripe", "Twilio",
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
