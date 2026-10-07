"use client";
import { useEffect } from "react";
import { EmptyState } from "./_components/AdminUI";
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Admin workspace failed to load", error); }, [error]);
  return <section className="adm-panel"><EmptyState title="We couldn’t load this page" description="Try again to reload the workspace." action={<button type="button" className="adm-button adm-button-primary" onClick={reset}>Try again</button>} /></section>;
}
