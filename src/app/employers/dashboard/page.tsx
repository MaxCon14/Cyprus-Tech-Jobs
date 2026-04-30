import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardGuard } from "./DashboardGuard";
import { formatSalary, remoteLabel, timeAgo } from "@/lib/utils";
import { JOBS } from "@/lib/placeholder-data";
import { Plus, Eye, Edit2, Pause, Trash2, BarChart2, Users, Briefcase, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Dashboard — CyprusTech.Jobs",
};

export const dynamic = "force-dynamic";

const MOCK_LISTINGS = JOBS.slice(0, 4).map((job, i) => ({
  ...job,
  status:  i === 2 ? "EXPIRED" : "ACTIVE",
  views:   [1240, 830, 312, 540][i],
  applies: [48,   31,  9,   22][i],
  daysLeft: [18, 7, 0, 24][i],
}));

const STATS = [
  { label: "Active listings",  value: "3",   icon: <Briefcase size={18} />, delta: null },
  { label: "Total views",      value: "2,922", icon: <Eye size={18} />,       delta: "+14% this week" },
  { label: "Applications",     value: "110",  icon: <Users size={18} />,     delta: "+6 today" },
  { label: "Avg. time to fill", value: "8 days", icon: <TrendingUp size={18} />, delta: null },
];

export default async function EmployerDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/employers/login?callbackUrl=/employers/dashboard");

  return (
    <DashboardGuard>
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 8 }}>EMPLOYER DASHBOARD · REVOLUT</div>
          <h1 className="h1">Your job listings</h1>
        </div>
        <Link href="/post-a-job" className="btn btn-accent">
          <Plus size={14} /> Post a new job
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 20, background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "var(--text-muted)" }}>{stat.icon}</span>
              {stat.delta && <span className="tag tag-success" style={{ fontSize: 10 }}>{stat.delta}</span>}
            </div>
            <div className="mono-l" style={{ fontSize: 24, color: "var(--text)", display: "block", marginBottom: 4 }}>{stat.value}</div>
            <div className="body-s" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Listings table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 32 }}>

        {/* Table header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>Listings</span>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="chip chip-active" style={{ padding: "4px 10px" }}>All</span>
            <span className="chip" style={{ padding: "4px 10px" }}>Active</span>
            <span className="chip" style={{ padding: "4px 10px" }}>Expired</span>
          </div>
        </div>

        {/* Table head row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 110px 120px 130px", gap: 16, padding: "10px 20px", borderBottom: "1px solid var(--border)" }}>
          {["Job", "Views", "Applies", "Status", "Expires", "Actions"].map(h => (
            <span key={h} className="caption" style={{ color: "var(--text-subtle)" }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {MOCK_LISTINGS.map(listing => (
          <div key={listing.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 110px 120px 130px", gap: 16, padding: "16px 20px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>

            {/* Job */}
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{listing.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="tag">{listing.city}</span>
                <span className="tag tag-outline">{remoteLabel(listing.remoteType)}</span>
                {listing.featured && <span className="tag tag-accent">Featured</span>}
              </div>
              <div className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 4 }}>
                {formatSalary(listing.salaryMin, listing.salaryMax)} · Posted {timeAgo(listing.postedAt!)}
              </div>
            </div>

            {/* Views */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Eye size={13} style={{ color: "var(--text-subtle)" }} />
                <span className="mono-s" style={{ color: "var(--text)" }}>{listing.views.toLocaleString()}</span>
              </div>
            </div>

            {/* Applies */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={13} style={{ color: "var(--text-subtle)" }} />
                <span className="mono-s" style={{ color: "var(--text)" }}>{listing.applies}</span>
              </div>
            </div>

            {/* Status */}
            <div>
              {listing.status === "ACTIVE" ? (
                <span className="tag tag-success tag-pulse">Active</span>
              ) : (
                <span className="tag tag-error">Expired</span>
              )}
            </div>

            {/* Expires */}
            <div className="mono-s" style={{ color: listing.daysLeft <= 7 && listing.status === "ACTIVE" ? "var(--warning)" : "var(--text-subtle)" }}>
              {listing.status === "EXPIRED" ? "—" : listing.daysLeft <= 7 ? `${listing.daysLeft}d left` : `${listing.daysLeft} days`}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 4 }}>
              <button className="btn btn-icon btn-ghost btn-sm" title="View listing">
                <Eye size={13} />
              </button>
              <button className="btn btn-icon btn-ghost btn-sm" title="Edit listing">
                <Edit2 size={13} />
              </button>
              <button className="btn btn-icon btn-ghost btn-sm" title="Pause listing">
                <Pause size={13} />
              </button>
              <button className="btn btn-icon btn-ghost btn-sm" title="Delete listing" style={{ color: "var(--error)" }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics teaser */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Views chart placeholder */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={15} style={{ color: "var(--accent)" }} />
              <h3 className="h3">Views this week</h3>
            </div>
            <span className="tag tag-success">+14%</span>
          </div>
          {/* Bar chart — CSS only */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {[40, 55, 35, 70, 85, 60, 90].map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: `${h}%`, background: i === 6 ? "var(--accent)" : "var(--bg-muted)", borderRadius: "4px 4px 0 0", transition: "height 400ms cubic-bezier(0.16,1,0.3,1)" }} />
                <span className="mono-s" style={{ color: "var(--text-subtle)", fontSize: 9 }}>
                  {["M","T","W","T","F","S","S"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top performing listing */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 24, background: "var(--surface)" }}>
          <h3 className="h3" style={{ marginBottom: 16 }}>Top performing listing</h3>
          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{MOCK_LISTINGS[0].title}</div>
            <div className="mono-s" style={{ color: "var(--text-subtle)" }}>Posted {timeAgo(MOCK_LISTINGS[0].postedAt!)}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Views",   "1,240"],
              ["Applies", "48"],
              ["CTR",     "3.9%"],
              ["Saves",   "112"],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: "10px 14px", background: "var(--bg-muted)", borderRadius: 8 }}>
                <div className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 2 }}>{label}</div>
                <div className="mono-l" style={{ color: "var(--text)" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Upgrade CTA */}
      <div style={{ marginTop: 32, border: "1px solid var(--accent)", borderRadius: 10, padding: "20px 24px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Upgrade to Featured for more visibility</div>
          <div className="body-s" style={{ color: "var(--text-muted)" }}>Featured listings get 2× more applications and are pinned to the top for 7 days.</div>
        </div>
        <Link href="/post-a-job#pricing" className="btn btn-accent">Upgrade listing →</Link>
      </div>
    </div>
    </DashboardGuard>
  );
}
