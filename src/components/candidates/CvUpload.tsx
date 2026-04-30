"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X, ExternalLink, Loader2 } from "lucide-react";

interface Props {
  currentUrl: string;
  onChange: (url: string) => void;
}

export function CvUpload({ currentUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large — maximum 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/candidates/cv-upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const filename = currentUrl
    ? decodeURIComponent(currentUrl.split("/").pop() ?? "cv.pdf").replace(/^.*cv-\d+\.pdf$/, "cv.pdf")
    : null;

  return (
    <div>
      {currentUrl ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)", background: "var(--bg-muted)",
        }}>
          <FileText size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
              {filename}
            </p>
            <p className="mono-s" style={{ color: "var(--text-subtle)" }}>PDF uploaded</p>
          </div>
          <a href={currentUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--text-subtle)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <ExternalLink size={14} />
          </a>
          <button type="button" onClick={() => onChange("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "grid", placeItems: "center", flexShrink: 0, padding: 2 }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          disabled={uploading}
          style={{
            width: "100%", padding: "20px 16px",
            borderRadius: "var(--radius-md)",
            border: "2px dashed var(--border-strong)",
            background: "var(--bg-muted)",
            cursor: uploading ? "default" : "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            transition: "border-color 150ms ease",
          }}
        >
          {uploading
            ? <Loader2 size={22} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
            : <Upload size={22} style={{ color: "var(--text-muted)" }} />
          }
          <span className="body-s" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
            {uploading ? "Uploading…" : "Click or drag to upload your CV"}
          </span>
          <span className="mono-s" style={{ color: "var(--text-subtle)" }}>PDF only · max 5 MB</span>
        </button>
      )}

      {!currentUrl && currentUrl !== undefined && (
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
          onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload size={13} /> {currentUrl ? "Replace CV" : "Upload PDF"}
        </button>
      )}

      {error && (
        <p className="body-s" style={{ color: "var(--error)", marginTop: 8 }}>{error}</p>
      )}

      <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}
