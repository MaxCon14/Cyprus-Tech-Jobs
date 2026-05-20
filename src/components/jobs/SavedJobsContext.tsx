"use client";

import { createContext, useContext, useEffect, useState } from "react";

type SavedJobsCtx = {
  savedJobIds: string[] | undefined; // undefined while loading
  isCandidate: boolean;
};

const Ctx = createContext<SavedJobsCtx>({ savedJobIds: undefined, isCandidate: false });

export function SavedJobsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SavedJobsCtx>({ savedJobIds: undefined, isCandidate: false });

  useEffect(() => {
    fetch("/api/candidates/saved-jobs")
      .then(r => r.json())
      .then(d => setState({ savedJobIds: d.savedJobIds ?? [], isCandidate: d.isCandidate ?? false }))
      .catch(() => setState({ savedJobIds: [], isCandidate: false }));
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useSavedJobs() {
  return useContext(Ctx);
}
