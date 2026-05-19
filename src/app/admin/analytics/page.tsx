import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTable, AdminTr, AdminTd } from "../_components/AdminTable";

export const dynamic = "force-dynamic";

// Group clicks by day for the last 30 days
async function getClicksByDay() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clicks = await prisma.applyClick.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, jobId: true },
    orderBy: { createdAt: "asc" },
  });
  const byDay: Record<string, number> = {};
  clicks.forEach(c => {
    const day = c.createdAt.toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  });
  return byDay;
}

export default async function AdminAnalyticsPage() {
  const [
    topJobs,
    totalClicks,
    clicksLast7,
    clicksLast30,
    totalAlerts,
    byDay,
    { count: totalCandidates },
    { count: totalEmployers },
    { count: newCandidatesLast30Count },
  ] = await Promise.all([
    prisma.job.findMany({
      where: { status: "ACTIVE" },
      include: { company: true, category: true, _count: { select: { applyClicks: true } } },
      orderBy: { applyClicks: { _count: "desc" } },
      take: 20,
    }),
    prisma.applyClick.count(),
    prisma.applyClick.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.applyClick.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    prisma.jobAlert.count(),
    getClicksByDay(),
    supabaseAdmin.from("candidates").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("employers").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("candidates").select("*", { count: "exact", head: true })
      .gte("createdAt", new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);

  const summaryStats = [
    { label: "Total apply clicks",   value: totalClicks },
    { label: "Clicks (last 7 days)", value: clicksLast7 },
    { label: "Clicks (last 30 days)",value: clicksLast30 },
    { label: "Job alert subscribers",value: totalAlerts },
    { label: "Total candidates",     value: totalCandidates ?? 0 },
    { label: "New candidates (30d)", value: newCandidatesLast30Count ?? 0 },
    { label: "Total employers",      value: totalEmployers ?? 0 },
  ];

  const dayEntries = Object.entries(byDay).slice(-14);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Analytics</h1>
        <p className="body-s" style={{ color: "var(--text-subtle)" }}>Apply clicks and platform reports</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 36 }}>
        {summaryStats.map(s => (
          <div key={s.label} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px", background: "var(--surface)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--text-subtle)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Click trend (last 14 days) */}
      {dayEntries.length > 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "var(--surface)", marginBottom: 36 }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Apply clicks — last 14 days</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {dayEntries.map(([day, count]) => {
              const maxVal = Math.max(...dayEntries.map(([, v]) => v), 1);
              const pct = (count / maxVal) * 100;
              return (
                <div key={day} title={`${day}: ${count} clicks`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", background: "var(--accent)", borderRadius: 3, height: `${pct}%`, minHeight: count > 0 ? 4 : 0, transition: "height 300ms" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-subtle)", transform: "rotate(-45deg)", transformOrigin: "top left", marginTop: 2 }}>
                    {day.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top jobs by clicks */}
      <div>
        <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Top jobs by apply clicks</h2>
        <AdminTable columns={["Title", "Company", "Category", "Apply clicks"]}>
          {topJobs.map(j => (
            <AdminTr key={j.id}>
              <AdminTd><span style={{ fontWeight: 600 }}>{j.title}</span></AdminTd>
              <AdminTd subtle>{j.company?.name ?? j.curatedCompanyName ?? "—"}</AdminTd>
              <AdminTd subtle>{j.category.name}</AdminTd>
              <AdminTd mono right>{j._count.applyClicks}</AdminTd>
            </AdminTr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
