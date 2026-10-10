import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Job alerts confirmed", robots: { index: false, follow: false } };
export default function ConfirmedAlerts() {
  return <main className="page-container" style={{ paddingBlock: 64, maxWidth: 640 }}>
    <h1 className="h1">Your job alerts are confirmed</h1>
    <p className="body" style={{ marginBlock: 24 }}>We will email matching new vacancies on your selected schedule. Every alert includes an unsubscribe link.</p>
    <Link href="/jobs" className="btn btn-accent">Browse current jobs</Link>
  </main>;
}
