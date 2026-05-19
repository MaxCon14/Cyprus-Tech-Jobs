import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalJobs,
    activeJobs,
    draftJobs,
    expiredJobs,
    totalEmployers,
    blockedEmployers,
    totalCompanies,
    featuredCompanies,
    totalAlerts,
    totalClicks,
    totalCategories,
    totalTags,
    totalBlogPosts,
    recentJobs,
    topJobsByClicks,
    { count: totalCandidates },
    { count: blockedCandidates },
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.job.count({ where: { status: "DRAFT" } }),
    prisma.job.count({ where: { status: "EXPIRED" } }),
    prisma.employer.count(),
    prisma.employer.count({ where: { blocked: true } }),
    prisma.company.count(),
    prisma.company.count({ where: { featured: true } }),
    prisma.jobAlert.count(),
    prisma.applyClick.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.blogPost.count(),
    prisma.job.findMany({
      take: 8, orderBy: { createdAt: "desc" },
      include: { company: true, category: true },
    }),
    prisma.job.findMany({
      take: 5,
      include: { company: true, _count: { select: { applyClicks: true } } },
      where: { status: "ACTIVE" },
      orderBy: { applyClicks: { _count: "desc" } },
    }),
    supabaseAdmin.from("candidates").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("candidates").select("*", { count: "exact", head: true }).eq("blocked", true),
  ]);

  const stats = [
    { label: "Active jobs",      value: activeJobs,           sub: `${totalJobs} total`,       href: "/admin/jobs",     accent: true },
    { label: "Candidates",       value: totalCandidates ?? 0, sub: `${blockedCandidates ?? 0} blocked`, href: "/admin/users" },
    { label: "Employers",        value: totalEmployers,        sub: `${blockedEmployers} blocked`, href: "/admin/users" },
    { label: "Companies",        value: totalCompanies,        sub: `${featuredCompanies} featured`, href: "/admin/companies" },
    { label: "Apply clicks",     value: totalClicks,           sub: "all time",                 href: "/admin/analytics" },
    { label: "Job alerts",       value: totalAlerts,           sub: "subscribers",              href: "/admin/analytics" },
    { label: "Blog posts",       value: totalBlogPosts,        sub: "",                         href: "/admin/blog" },
    { label: "Draft jobs",       value: draftJobs,             sub: `${expiredJobs} expired`,   href: "/admin/jobs" },
  ];

  const statusColor: Record<string, string> = {
    ACTIVE: "var(--success)", DRAFT: "var(--text-subtle)",
    EXPIRED: "var(--warning)", PAUSED: "var(--info)", CLOSED: "var(--error, #ef4444)",
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>Platform overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 36 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
            <div style={{
              border: `1px solid ${s.accent ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 10, padding: "18px 20px",
              background: s.accent ? "var(--accent-soft)" : "var(--surface)",
              transition: "border-color 150ms",
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: s.accent ? "var(--accent)" : "var(--text)", marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
              {s.sub && <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{s.sub}</div>}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent jobs */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600 }}>Recent jobs</h2>
            <Link href="/admin/jobs" className="mono-s" style={{ color: "var(--text-subtle)", textDecoration: "none", fontSize: 11 }}>View all →</Link>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            {recentJobs.map((j, i) => (
              <div key={j.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderTop: i > 0 ? "1px solid var(--border)" : undefined,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title}</div>
                  <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{j.company?.name ?? j.curatedCompanyName ?? "—"}</div>
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                  color: statusColor[j.status] ?? "var(--text-subtle)",
                  background: "var(--bg-muted)", borderRadius: 4, padding: "2px 6px", flexShrink: 0, marginLeft: 8,
                }}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top by clicks */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600 }}>Top jobs by apply clicks</h2>
            <Link href="/admin/analytics" className="mono-s" style={{ color: "var(--text-subtle)", textDecoration: "none", fontSize: 11 }}>Analytics →</Link>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            {topJobsByClicks.length === 0 && (
              <div style={{ padding: "20px 14px", color: "var(--text-subtle)", fontSize: 13 }}>No clicks tracked yet.</div>
            )}
            {topJobsByClicks.map((j, i) => (
              <div key={j.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderTop: i > 0 ? "1px solid var(--border)" : undefined,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title}</div>
                  <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{j.company?.name ?? j.curatedCompanyName ?? "—"}</div>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--accent)", flexShrink: 0, marginLeft: 8 }}>
                  {j._count.applyClicks}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
