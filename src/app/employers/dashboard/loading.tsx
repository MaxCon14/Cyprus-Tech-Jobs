export default function EmployerDashboardLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      <div className="employer-page-inner">

        {/* ── Company hero ── */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
          padding: "clamp(20px,3vw,28px) clamp(16px,3vw,32px)", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 13, flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="skeleton" style={{ width: 160, height: 18 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 99 }} />
                <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 99 }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div className="skeleton" style={{ width: 110, height: 34, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 120, height: 34, borderRadius: 8 }} />
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="employer-stats-grid" style={{ marginBottom: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
              <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: 48, height: 28, borderRadius: 4, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 4 }} />
            </div>
          ))}
        </div>

        {/* ── Slot balance ── */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "14px clamp(16px,3vw,20px)", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <div className="skeleton" style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }} />
          <div className="skeleton" style={{ width: 130, height: 14 }} />
          <div style={{ width: 1, height: 16, background: "var(--border)" }} />
          <div className="skeleton" style={{ width: 130, height: 14 }} />
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div className="skeleton" style={{ width: 90, height: 30, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 80, height: 30, borderRadius: 8 }} />
          </div>
        </div>

        {/* ── Job listings table ── */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          {/* Table header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px clamp(16px,3vw,24px)", borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
            <div className="skeleton" style={{ width: 100, height: 14 }} />
            <div className="skeleton" style={{ width: 100, height: 30, borderRadius: 8 }} />
          </div>

          {/* Job rows */}
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr auto auto auto auto",
              alignItems: "center", gap: 16,
              padding: "16px clamp(16px,3vw,24px)",
              borderBottom: i < 3 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton" style={{ width: `${140 + (i % 3) * 40}px`, height: 14 }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="skeleton" style={{ width: 55, height: 18, borderRadius: 99 }} />
                  <div className="skeleton" style={{ width: 68, height: 18, borderRadius: 99 }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 64, height: 12 }} />
              <div className="skeleton" style={{ width: 72, height: 12 }} />
              <div style={{ display: "flex", gap: 4 }}>
                <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
