"use client";

interface Props {
  jobId: string;
  applyUrl?: string;
  applyEmail?: string;
  companyName: string;
}

function ensureAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function ApplyButton({ jobId, applyUrl, applyEmail, companyName }: Props) {
  function handleClick() {
    fetch("/api/candidates/applied-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    }).catch(() => {/* non-critical */});

    if (applyEmail && !applyUrl) {
      window.location.href = `mailto:${applyEmail}`;
    } else if (applyUrl) {
      window.open(ensureAbsoluteUrl(applyUrl), "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        onClick={handleClick}
        className="btn btn-accent btn-lg"
        style={{ width: "100%", justifyContent: "center" }}
      >
        Apply for this role →
      </button>
      <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center" }}>
        APPLIES TO {companyName.toUpperCase()} DIRECTLY
      </p>
    </div>
  );
}
