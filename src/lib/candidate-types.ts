// Types matching the `candidates` and `candidate_positions` Supabase tables

export interface CandidateRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  dribbbleUrl: string | null;
  behanceUrl: string | null;
  twitterUrl: string | null;
  mediumUrl: string | null;
  cvUrl: string | null;
  city: string | null;
  remoteType: "REMOTE" | "HYBRID" | "ON_SITE" | null;
  experienceLevel: "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE" | null;
  salaryMin: number | null;
  openToWork: boolean;
  categories: string[];
  skills: string[];
  alertFrequency: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PositionRow {
  id: string;
  candidateId: string;
  title: string;
  company: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string | null;
}
