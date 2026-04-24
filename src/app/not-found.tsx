import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
      <div className="mono-l" style={{ color: "var(--accent)", marginBottom: 16 }}>404</div>
      <h1 className="display-m" style={{ marginBottom: 12 }}>Page not found</h1>
      <p className="body" style={{ color: "var(--text-muted)", marginBottom: 40 }}>
        This page doesn't exist — but there are plenty of great tech jobs that do.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/jobs" className="btn btn-accent">Browse jobs →</Link>
        <Link href="/" className="btn btn-outline">Go home</Link>
      </div>
    </div>
  );
}
