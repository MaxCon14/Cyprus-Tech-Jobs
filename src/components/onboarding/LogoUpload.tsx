"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function LogoUpload({ value, onChange }: Props) {
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Mirrors the formats the server sniffs for. SVG is excluded on purpose —
    // it can carry script and the logo bucket is public.
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a JPG, PNG, WebP or GIF image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }

    setError("");
    setUploading(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res  = await fetch("/api/employers/logo-upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <div style={{ width: 72, height: 72, borderRadius: 12, border: "2px solid var(--border)", background: "var(--bg-muted)", display: "grid", placeItems: "center" }}>
        <Loader2 size={20} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (value) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
        <div style={{ position: "relative", width: 72, height: 72 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Company logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", border: "2px solid var(--border)" }} />
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: "var(--error)", border: "2px solid var(--surface)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}
          >
            <X size={10} style={{ color: "#fff" }} />
          </button>
        </div>
        {error && <p style={{ fontSize: 11, color: "var(--error)", margin: 0 }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        style={{
          width: 72, height: 72, borderRadius: 12,
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
          background: dragging ? "var(--accent-soft)" : "var(--bg-muted)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, cursor: "pointer", transition: "all 200ms ease",
        }}
      >
        <Camera size={18} style={{ color: dragging ? "var(--accent)" : "var(--text-subtle)" }} />
        <span style={{ fontSize: 9, color: "var(--text-subtle)", fontFamily: "var(--font-sans)" }}>Logo</span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <p style={{ fontSize: 11, color: "var(--error)", margin: 0 }}>{error}</p>}
    </div>
  );
}
