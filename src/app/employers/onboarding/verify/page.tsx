import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify your email — CyprusTech.Jobs",
};

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { success, error } = await searchParams;

  if (success) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--success)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 24px",
          }}
        >
          <CheckCircle2 size={32} style={{ color: "var(--white)" }} strokeWidth={2} />
        </div>
        <h1 className="h1" style={{ marginBottom: 12 }}>Email verified!</h1>
        <p className="body" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
          Your employer account is now fully active. You can start posting jobs and managing your company profile.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/post-a-job" className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center" }}>
            Post your first job →
          </Link>
          <Link href="/employers/dashboard" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error === "expired") {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--warning-bg)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 24px",
          }}
        >
          <Clock size={32} style={{ color: "var(--warning)" }} />
        </div>
        <h1 className="h1" style={{ marginBottom: 12 }}>Link expired</h1>
        <p className="body" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
          This verification link has expired (they&apos;re valid for 24 hours). Go back to your onboarding to request a new one.
        </p>
        <Link href="/employers/onboarding" className="btn btn-accent" style={{ justifyContent: "center" }}>
          Back to onboarding
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--error-bg)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 24px",
          }}
        >
          <XCircle size={32} style={{ color: "var(--error)" }} />
        </div>
        <h1 className="h1" style={{ marginBottom: 12 }}>Invalid link</h1>
        <p className="body" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
          This verification link is invalid or has already been used. Please return to onboarding to request a new one.
        </p>
        <Link href="/employers/onboarding" className="btn btn-accent" style={{ justifyContent: "center" }}>
          Back to onboarding
        </Link>
      </div>
    );
  }

  // Default: no params — someone landed here directly
  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <h1 className="h1" style={{ marginBottom: 12 }}>Verify your email</h1>
      <p className="body" style={{ color: "var(--text-muted)", marginBottom: 32 }}>
        Click the link in the email we sent you to verify your employer account.
      </p>
      <Link href="/employers/onboarding" className="btn btn-outline" style={{ justifyContent: "center" }}>
        Back to onboarding
      </Link>
    </div>
  );
}
