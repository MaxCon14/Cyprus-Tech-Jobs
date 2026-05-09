import Link from "next/link";
import { CheckCircle2, Briefcase, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Slots Added — CyprusTech.Jobs" };

export default async function BuyCreditsSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(40px,6vw,80px) var(--page-padding-x)" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--success-bg)", display: "grid", placeItems: "center", margin: "0 auto 24px" }}>
          <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
        </div>

        <h1 className="display-m" style={{ marginBottom: 12 }}>Slots added!</h1>
        <p className="body" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
          Your listing slots have been added to your account. Go post your first job now.
        </p>

        {session_id && (
          <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 24 }}>
            Reference: {session_id.slice(-12).toUpperCase()}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/post-a-job" className="btn btn-accent" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Briefcase size={14} /> Post a job now
          </Link>
          <Link href="/buy-credits" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={14} /> Buy more slots
          </Link>
        </div>
      </div>
    </div>
  );
}
