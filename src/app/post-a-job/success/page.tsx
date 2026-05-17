import Link from "next/link";
import { CheckCircle2, ArrowRight, Briefcase } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Posted Successfully — CyprusTech.Careers",
};

export default async function PostJobSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div style={{
      minHeight: "80vh",
      display:   "flex",
      alignItems:"center",
      justifyContent: "center",
      padding:   "clamp(40px, 6vw, 80px) var(--page-padding-x)",
    }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "var(--success-bg)",
          display: "grid", placeItems: "center",
          margin: "0 auto 24px",
        }}>
          <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
        </div>

        <h1 className="display-m" style={{ marginBottom: 12 }}>
          Payment confirmed!
        </h1>

        <p className="body" style={{ color: "var(--text-muted)", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          Your job listing is now under review. It will go live within 30 minutes once our team approves it.
        </p>

        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 24, marginBottom: 32, textAlign: "left",
        }}>
          {[
            ["Step 1 — Payment received", "Your payment has been processed successfully.", true],
            ["Step 2 — Under review", "Our team will review your listing within 30 minutes.", false],
            ["Step 3 — Go live", "Your job will appear in search results and candidate alerts.", false],
          ].map(([title, desc, done]) => (
            <div key={title as string} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                background: done ? "var(--success-bg)" : "var(--bg-muted)",
                border: done ? "none" : "1.5px solid var(--border-strong)",
                display: "grid", placeItems: "center",
              }}>
                {done && <CheckCircle2 size={12} style={{ color: "var(--success)" }} />}
              </span>
              <div>
                <p className="body-s" style={{ fontWeight: 600, marginBottom: 2 }}>{title as string}</p>
                <p className="body-s" style={{ color: "var(--text-muted)" }}>{desc as string}</p>
              </div>
            </div>
          ))}
        </div>

        {session_id && (
          <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 24 }}>
            Reference: {session_id.slice(-12).toUpperCase()}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/jobs" className="btn btn-accent" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Briefcase size={14} /> Browse jobs
          </Link>
          <Link href="/employers/dashboard" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            View dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
