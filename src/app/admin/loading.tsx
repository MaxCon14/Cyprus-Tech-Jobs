export default function AdminLoading() {
  return <div className="adm-loading" role="status" aria-label="Loading workspace"><span className="adm-sr-only">Loading workspace…</span><div className="adm-skeleton" style={{ height: 72, maxWidth: 450 }} /><div className="adm-stats-grid">{[0, 1, 2, 3].map(n => <div className="adm-skeleton" key={n} />)}</div><div className="adm-skeleton" style={{ height: 320 }} /></div>;
}
