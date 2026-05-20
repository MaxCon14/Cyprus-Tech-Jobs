"use client";

import { SavedJobsProvider } from "@/components/jobs/SavedJobsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SavedJobsProvider>{children}</SavedJobsProvider>;
}
