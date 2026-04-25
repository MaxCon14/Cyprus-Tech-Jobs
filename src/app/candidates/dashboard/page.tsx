import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ProfileSection, LinksSection, ExperienceSection } from "./ProfileEditor";
import { SignOutClient } from "./SignOutClient";
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My profile — CyprusTech.Jobs",
};

export default async function CandidateDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/candidates/login");

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("email", user.email)
    .single();

  if (!candidate) redirect("/candidates/onboarding");

  const c = candidate as CandidateRow;

  const { data: positions } = await supabaseAdmin
    .from("candidate_positions")
    .select("*")
    .eq("candidateId", c.id)
    .order("current", { ascending: false })
    .order("startDate", { ascending: false });

  const pos = (positions ?? []) as PositionRow[];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 100px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, gap: 16, flexWrap: "wrap" }}>
        <div>
          <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 8 }}>Candidate dashboard</p>
          <h1 className="h1">Hey, {c.firstName ?? "there"} 👋</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/jobs" className="btn btn-outline btn-sm">Browse jobs</Link>
          <SignOutClient />
        </div>
      </div>

      {/* Email unverified banner */}
      {!c.emailVerified && (
        <div className="alert alert-warning" style={{ borderRadius: 10, marginBottom: 28 }}>
          <span className="body-s">
            <strong>Verify your email</strong> — check your inbox for the sign-in link we sent to <strong>{c.email}</strong>.
          </span>
        </div>
      )}

      {/* Profile sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ProfileSection candidate={c} />
        <LinksSection candidate={c} />
        <ExperienceSection candidateId={c.id} initialPositions={pos} />
        <PreferencesCard candidate={c} />
      </div>
    </div>
  );
}

function PreferencesCard({ candidate: c }: { candidate: CandidateRow }) {
  const rows: [string, string][] = [
    ["Categories",  c.categories.length > 0 ? c.categories.join(", ") : "All"],
    ["Work type",   c.remoteType ?? "Any"],
    ["Location",    c.city ?? "All cities"],
    ["Level",       c.experienceLevel ?? "Any"],
    ["Min. salary", c.salaryMin ? `€${c.salaryMin.toLocaleString()}` : "Not set"],
    ["Job alerts",  c.alertFrequency === "DAILY" ? "Daily digest" : "Weekly roundup"],
  ];

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>Job preferences</p>
        <Link href="/candidates/onboarding" className="btn btn-ghost btn-sm">Update</Link>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span className="body-s" style={{ color: "var(--text-muted)" }}>{label}</span>
            <span className="mono-s" style={{ color: "var(--text)", textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
