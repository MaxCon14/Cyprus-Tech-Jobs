export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobBySlug, getSimilarJobs } from "@/lib/queries";
import { serialiseJob } from "@/lib/serialise";
import { JobCard } from "@/components/jobs/JobCard";
import { formatSalary, remoteLabel, timeAgo } from "@/lib/utils";
import { MapPin, Clock, Briefcase, Building2, ExternalLink, ChevronLeft, Check } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  return {
    title: `${job.title} at ${job.company.name}`,
    description: `${job.title} at ${job.company.name} in ${job.city}. ${formatSalary(job.salaryMin, job.salaryMax)} · ${remoteLabel(job.remoteType)}`,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const similarRaw = await getSimilarJobs(job.id, job.categoryId, 3);
  const similar    = similarRaw.map(serialiseJob);
  const salary     = formatSalary(job.salaryMin, job.salaryMax);

  const metaItems = [
    { icon: <MapPin size={14} />,     label: job.city ?? "Cyprus" },
    { icon: <Briefcase size={14} />,  label: remoteLabel(job.remoteType) },
    { icon: <Clock size={14} />,      label: job.employmentType.replace("_", " ") },
    { icon: <Building2 size={14} />,  label: job.company.city ?? "Cyprus" },
  ];

  const descBlocks = job.description.split("\n\n");

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <Link href="/jobs" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>
          <ChevronLeft size={14} /> Jobs
        </Link>
        <span style={{ color: "var(--border-strong)" }}>/</span>
        <span className="body-s" style={{ color: "var(--text-subtle)" }}>{job.title}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>

        {/* Left */}
        <div>
          {/* Header card */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 28, marginBottom: 24, background: "var(--surface)" }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ width: 64, height: 64, borderRadius: 10, flexShrink: 0, background: "var(--black)", color: "var(--white)", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 22, border: "1px solid var(--border)" }}>
                {job.company.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <Link href={`/companies/${job.company.slug}`} style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}>
                    {job.company.name}
                  </Link>
                  {job.company.verified && <span className="tag tag-success" style={{ fontSize: 10 }}>✓ Verified</span>}
                  {job.postedAt && <span className="mono-s" style={{ color: "var(--text-subtle)" }}>· {timeAgo(job.postedAt)}</span>}
                </div>
                <h1 className="h1" style={{ marginBottom: 14 }}>{job.title}</h1>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {metaItems.map((m, i) => (
                    <span key={i} className="tag tag-outline" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {m.icon} {m.label}
                    </span>
                  ))}
                  {job.tags.map(t => (
                    <span key={t.tag.name} className="tag">{t.tag.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 28, marginBottom: 24, background: "var(--surface)" }}>
            <h2 className="h2" style={{ marginBottom: 20 }}>About the role</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {descBlocks.map((block, i) => {
                if (block.startsWith("**") && block.endsWith("**")) {
                  return <h3 key={i} className="h3" style={{ marginTop: 8 }}>{block.replace(/\*\*/g, "")}</h3>;
                }
                if (block.startsWith("- ")) {
                  return (
                    <ul key={i} style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 0, listStyle: "none" }}>
                      {block.split("\n").map((line, j) => (
                        <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", marginTop: 8, flexShrink: 0 }} />
                          <span className="body">{line.replace(/^- /, "")}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i} className="body" style={{ color: "var(--text-muted)" }}>{block}</p>;
              })}
            </div>
          </div>

          {/* Skills */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 28, background: "var(--surface)" }}>
            <h2 className="h2" style={{ marginBottom: 16 }}>Skills & requirements</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {job.tags.map(t => (
                <span key={t.tag.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "var(--bg-muted)", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  <Check size={11} style={{ color: "var(--success)" }} /> {t.tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>

          {/* Apply card */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
            {salary && (
              <div style={{ marginBottom: 16 }}>
                <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 4 }}>ANNUAL SALARY</div>
                <div className="mono-l" style={{ color: "var(--accent)", fontSize: 20 }}>{salary}</div>
              </div>
            )}
            <a href={job.applyUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}>
              Apply for this role →
            </a>
            <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
              APPLIES TO {job.company.name.toUpperCase()} DIRECTLY
            </p>
          </div>

          {/* Job meta */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16 }}>JOB DETAILS</div>
            {[
              ["Company",    job.company.name],
              ["Location",   job.city ?? "Cyprus"],
              ["Work type",  remoteLabel(job.remoteType)],
              ["Employment", job.employmentType.replace("_", " ")],
              ["Level",      job.experienceLevel],
              ["Posted",     job.postedAt ? timeAgo(job.postedAt) : "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="body-s" style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="mono-s" style={{ color: "var(--text)" }}>{value}</span>
              </div>
            ))}
            {job.company.website && (
              <a href={`https://${job.company.website}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, color: "var(--accent)", fontSize: 12, fontFamily: "var(--font-mono)", textDecoration: "none" }}>
                <ExternalLink size={11} /> {job.company.website}
              </a>
            )}
          </div>

          {/* Company snippet */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--black)", color: "var(--white)", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {job.company.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>{job.company.name}</div>
                <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{job.category.name}</div>
              </div>
            </div>
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 14 }}>
              {job.company.description?.slice(0, 120)}…
            </p>
            <Link href={`/companies/${job.company.slug}`} className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }}>
              View company →
            </Link>
          </div>
        </aside>
      </div>

      {/* Similar jobs */}
      {similar.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 className="h2">Similar roles</h2>
            <Link href="/jobs" className="mono-s" style={{ color: "var(--text-subtle)", textDecoration: "none" }}>VIEW ALL →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {similar.map(j => <JobCard key={j.id} {...j} />)}
          </div>
        </div>
      )}
    </div>
  );
}
