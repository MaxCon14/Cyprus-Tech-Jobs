function SkeletonCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader() {
  return (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="skeleton" style={{ width: 100, height: 14 }} />
      <div className="skeleton" style={{ width: 60, height: 26, borderRadius: 8 }} />
    </div>
  );
}

function SkeletonRows({ count, widths }: { count: number; widths?: number[] }) {
  return (
    <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="skeleton" style={{ width: `${widths?.[i % widths.length] ?? 160}px`, height: 13 }} />
          <div className="skeleton" style={{ width: `${(widths?.[i % widths.length] ?? 160) * 0.6}px`, height: 11 }} />
        </div>
      ))}
    </div>
  );
}

export default function CandidateDashboardLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      <div className="dashboard-page-padding" style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Profile hero ── */}
        <div className="dashboard-hero" style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
          padding: "24px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flex: 1 }}>
            <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 14, flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="skeleton" style={{ width: 180, height: 20 }} />
              <div className="skeleton" style={{ width: 240, height: 13 }} />
              <div style={{ display: "flex", gap: 6 }}>
                <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 99 }} />
                <div className="skeleton" style={{ width: 58, height: 22, borderRadius: 99 }} />
                <div className="skeleton" style={{ width: 52, height: 22, borderRadius: 99 }} />
              </div>
            </div>
          </div>
          {/* Completion ring placeholder */}
          <div className="dashboard-hero-ring" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div className="skeleton" style={{ width: 72, height: 72, borderRadius: "50%" }} />
            <div className="skeleton" style={{ width: 60, height: 11, borderRadius: 4 }} />
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="dashboard-two-col">

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Profile card */}
            <SkeletonCard>
              <CardHeader />
              <div style={{ padding: "18px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
                  <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton" style={{ width: "70%", height: 14 }} />
                    <div className="skeleton" style={{ width: "50%", height: 12 }} />
                    <div className="skeleton" style={{ width: "85%", height: 12 }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[80, 60, 75].map((w, i) => (
                    <div key={i} className="skeleton" style={{ width: `${w}%`, height: 12 }} />
                  ))}
                </div>
              </div>
            </SkeletonCard>

            {/* CV card */}
            <SkeletonCard>
              <CardHeader />
              <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="skeleton" style={{ width: "65%", height: 13 }} />
                  <div className="skeleton" style={{ width: "40%", height: 11 }} />
                </div>
              </div>
            </SkeletonCard>

            {/* Skills card */}
            <SkeletonCard>
              <CardHeader />
              <div style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[70, 90, 60, 80, 55, 75, 65].map((w, i) => (
                  <div key={i} className="skeleton" style={{ width: w, height: 26, borderRadius: 99 }} />
                ))}
              </div>
            </SkeletonCard>

            {/* Experience card */}
            <SkeletonCard>
              <CardHeader />
              <SkeletonRows count={3} widths={[200, 170, 185]} />
            </SkeletonCard>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Saved jobs */}
            <SkeletonCard>
              <CardHeader />
              <SkeletonRows count={3} widths={[190, 160, 175]} />
            </SkeletonCard>

            {/* Applied jobs */}
            <SkeletonCard>
              <CardHeader />
              <SkeletonRows count={2} widths={[180, 155]} />
            </SkeletonCard>

            {/* Alerts */}
            <SkeletonCard>
              <CardHeader />
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="skeleton" style={{ width: "90%", height: 12 }} />
                <div className="skeleton" style={{ width: "60%", height: 12 }} />
                <div className="skeleton" style={{ width: 100, height: 30, borderRadius: 8 }} />
              </div>
            </SkeletonCard>

            {/* Links */}
            <SkeletonCard>
              <CardHeader />
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[130, 150, 110].map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: w, height: 12 }} />
                  </div>
                ))}
              </div>
            </SkeletonCard>
          </div>
        </div>
      </div>
    </div>
  );
}
