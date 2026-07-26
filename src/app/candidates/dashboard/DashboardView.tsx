import Link from "next/link";
import {
  MapPin, Briefcase, CheckCircle2, Circle, AlertCircle,
  ExternalLink, ChevronRight, Heart,
} from "lucide-react";
import {
  ProfileSection, LinksSection, ExperienceSection,
  PreferencesSection, AlertSection, SkillsSection, CvSection,
} from "./ProfileEditor";
import { AppliedJobsCard } from "./AppliedJobsCard";
import { MyAlertsCard } from "@/components/alerts/MyAlertsCard";
import { remoteLabel, formatSalary } from "@/lib/utils";
import type { CandidateRow, PositionRow } from "@/lib/candidate-types";

/**
 * The dashboard's presentation, split from the page so the page can stay a thin
 * data layer — and so the layout can be rendered with stub data when checking it,
 * rather than being verifiable only by signing in as a real candidate.
 *
 * The page used to be eleven identical white cards on a white background, with
 * the right-hand column acting as a dumping ground: Links and Preferences (both
 * profile content) sat between Applied jobs and Alerts. Three things fix that,
 * all using tokens the design system already had:
 *
 *   1. The page sits on --bg-alt, not --bg, so white cards read as cards. Every
 *      other page on the site already does this; the dashboard was the outlier.
 *   2. Cards are grouped into three named zones that match how someone actually
 *      thinks about a job hunt — who I am, what I've done, what I'm looking for.
 *   3. Profile strength is stated once, in the hero, instead of twice with two
 *      different colour thresholds.
 */

export type SavedJob   = { id: string; slug: string; title: string; city: string | null; remoteType: string; companyName: string };
export type AppliedJob = { id: string; slug: string; title: string; city: string | null; companyName: string; appliedAt: string; status: string };
export type MatchingJob = {
  id: string; slug: string; title: string;
  salaryMin: number | null; salaryMax: number | null;
  company: { name: string } | null;
  curatedCompanyName: string | null;
};
export type Completion = { items: { label: string; done: boolean }[]; score: number; pct: number };

/** Strength colour, defined once. It was previously computed twice from the
 *  same number with different thresholds, so the two bars disagreed. */
function strengthColour(pct: number): string {
  if (pct < 40) return "var(--warning)";
  if (pct < 75) return "var(--accent)";
  return "var(--success)";
}

/** Zone label. The rule runs to the end of the column so the eye can see where
 *  one group of cards stops and the next begins. */
function ZoneHeading({ label, hint }: { label: string; hint: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 4 }}>
      <span className="caption" style={{ color: "var(--text)", letterSpacing: "0.1em", flexShrink: 0 }}>
        {label}
      </span>
      <span className="mono-s dashboard-zone-hint" style={{ color: "var(--text-subtle)", flexShrink: 0 }}>
        {hint}
      </span>
      <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

export function DashboardView({
  candidate: c, positions, completion, savedJobs, appliedJobs, matchingJobs,
}: {
  candidate: CandidateRow;
  positions: PositionRow[];
  completion: Completion;
  savedJobs: SavedJob[];
  appliedJobs: AppliedJob[];
  matchingJobs: MatchingJob[];
}) {
  const displayName = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-alt)" }}>
      <div className="dashboard-page-padding" style={{ maxWidth: 1100, margin: "0 auto" }}>

        {!c.emailVerified && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--warning-bg)", border: "1px solid var(--warning)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
            <AlertCircle size={16} style={{ color: "var(--warning)", flexShrink: 0 }} />
            <p className="body-s" style={{ margin: 0, color: "var(--text)" }}>
              <strong>Verify your email</strong>{" — we sent a sign-in link to "}<strong>{c.email}</strong>{". Check your inbox to activate your account."}
            </p>
          </div>
        )}

        {/* ── Hero. The one filled surface on the page; everything below it is a
              quiet white card, so this is what the eye lands on first. ── */}
        <div style={{
          background: "var(--accent-soft)",
          border: "1px solid var(--border)",
          borderRadius: 16, padding: "clamp(20px, 3vw, 28px)", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <h1 className="h1" style={{ margin: 0, color: "var(--text)" }}>{displayName}</h1>
            {c.openToWork && <span className="tag tag-success" style={{ fontSize: 11 }}>Open to work</span>}
          </div>

          <p className="body" style={{
            color: c.headline ? "var(--text-muted)" : "var(--text-subtle)",
            fontStyle: c.headline ? "normal" : "italic",
            margin: "0 0 12px",
          }}>
            {c.headline || "Add a professional headline…"}
          </p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
            {c.city && (
              <span className="tag" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <MapPin size={10} /> {c.city}
              </span>
            )}
            {c.remoteType && <span className="tag tag-outline">{remoteLabel(c.remoteType)}</span>}
            {c.experienceLevel && <span className="tag tag-outline">{c.experienceLevel}</span>}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="caption" style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
              PROFILE STRENGTH
            </span>
            <span className="mono" style={{ fontWeight: 700, color: strengthColour(completion.pct) }}>
              {`${completion.pct}%`}
            </span>
          </div>
          <div style={{ height: 8, width: "100%", background: "var(--surface)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${completion.pct}%`,
              background: strengthColour(completion.pct), borderRadius: 99,
              transition: "width 600ms var(--ease-out), background 400ms ease",
            }} />
          </div>
        </div>

        {/* ── What's left to do. The hero states the score; this says what moves it. ── */}
        {completion.pct < 100 && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
            padding: "18px 22px", marginBottom: 28,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>
                Finish your profile
              </p>
              <span className="mono-s" style={{ color: "var(--text-subtle)" }}>
                {`${completion.score}/${completion.items.length} DONE`}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {completion.items.map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.done
                    ? <CheckCircle2 size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                    : <Circle size={14} style={{ color: "var(--border-strong)", flexShrink: 0 }} />}
                  <span className="body-s" style={{ color: item.done ? "var(--text-subtle)" : "var(--text)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-two-col">

          {/* Everything an employer sees when you apply */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ZoneHeading label="YOUR PROFILE" hint="WHAT EMPLOYERS SEE" />
            <ProfileSection candidate={c} />
            <CvSection candidate={c} />
            <SkillsSection candidate={c} />
            <ExperienceSection candidateId={c.id} initialPositions={positions} />
            <LinksSection candidate={c} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* What you've done */}
            <ZoneHeading label="YOUR ACTIVITY" hint="SAVED & APPLIED" />
            <SavedJobsCard jobs={savedJobs} />
            <AppliedJobsCard jobs={appliedJobs} />
            {matchingJobs.length > 0 && <MatchingJobsCard jobs={matchingJobs} />}

            {/* What you're looking for */}
            <div style={{ marginTop: 14 }}>
              <ZoneHeading label="YOUR SEARCH" hint="WHAT YOU WANT" />
            </div>
            <PreferencesSection candidate={c} />
            <AlertSection candidate={c} />
            <MyAlertsCard />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Job cards ────────────────────────────────────────────────────────────────

function CardShell({ icon, title, action, children }: {
  icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--accent)", display: "flex" }}>{icon}</span>
          <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</p>
        </div>
        {action}
      </div>
      <div style={{ padding: "8px 20px 14px" }}>{children}</div>
    </div>
  );
}

function MatchingJobsCard({ jobs }: { jobs: MatchingJob[] }) {
  return (
    <CardShell
      icon={<Briefcase size={14} />}
      title="Jobs for you"
      action={<Link href="/jobs" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>All <ChevronRight size={11} /></Link>}
    >
      {jobs.map((job, i) => (
        <Link key={job.id} href={`/jobs/${job.slug}`}
          style={{ display: "block", textDecoration: "none", color: "inherit", padding: "12px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.title}
              </p>
              <p className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 4 }}>
                {job.company?.name ?? job.curatedCompanyName ?? ""}
              </p>
              {(job.salaryMin || job.salaryMax) && (
                <p className="mono-s" style={{ color: "var(--accent)" }}>{formatSalary(job.salaryMin, job.salaryMax)}</p>
              )}
            </div>
            <ExternalLink size={12} style={{ color: "var(--text-subtle)", flexShrink: 0, marginTop: 2 }} />
          </div>
        </Link>
      ))}
    </CardShell>
  );
}

function SavedJobsCard({ jobs }: { jobs: SavedJob[] }) {
  return (
    <CardShell
      icon={<Heart size={14} fill="var(--accent)" />}
      title="Saved jobs"
      action={<Link href="/jobs" className="btn btn-ghost btn-sm">Browse jobs</Link>}
    >
      {jobs.length === 0 ? (
        <p className="body-s" style={{ color: "var(--text-subtle)", padding: "10px 0", margin: 0 }}>
          Nothing saved yet. Hit the heart on any listing to keep it here.
        </p>
      ) : (
        jobs.map((job, i) => (
          <Link key={job.id} href={`/jobs/${job.slug}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none", textDecoration: "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.title}
              </p>
              <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
                {job.companyName}{job.city ? ` · ${job.city}` : ""}
              </p>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
          </Link>
        ))
      )}
    </CardShell>
  );
}
