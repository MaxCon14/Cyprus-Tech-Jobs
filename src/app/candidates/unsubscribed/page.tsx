import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Unsubscribed — CyprusTech.Careers" };

export default function UnsubscribedPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const isError = searchParams.error === "1";

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>

        <div style={{ width: 56, height: 56, borderRadius: "50%", background: isError ? "var(--bg-muted)" : "var(--accent-soft)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <span style={{ fontSize: 26 }}>{isError ? "🤔" : "✓"}</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 22, color: "var(--text)", marginBottom: 10 }}>
          {isError ? "That link didn't work" : "You've been unsubscribed"}
        </h1>

        <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.6 }}>
          {isError
            ? "This unsubscribe link may have already been used or expired. If you're still receiving emails, log in to manage your alerts."
            : "We've removed your job alert. You won't receive any more notifications for this subscription."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <Link href="/candidates/dashboard" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Manage all alerts
          </Link>
          <Link href="/jobs" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
            Browse jobs
          </Link>
        </div>

      </div>
    </div>
  );
}
