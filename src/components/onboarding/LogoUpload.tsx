"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

interface Props {
  file: File | null;
  preview: string | null;
  onChange: (file: File | null) => void;
}

export function LogoUpload({ file, preview, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    onChange(f);
  };

  if (preview) {
    return (
      <div style={{ position: "relative", width: 72, height: 72 }}>
        <img src={preview} alt="Company logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", border: "2px solid var(--border)" }} />
        <button
          type="button"
          onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
          style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: "var(--error)", border: "2px solid var(--surface)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}
        >
          <X size={10} style={{ color: "#fff" }} />
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      style={{
        width: 72,
        height: 72,
        borderRadius: 12,
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
        background: dragging ? "var(--accent-soft)" : "var(--bg-muted)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        cursor: "pointer",
        transition: "all 200ms ease",
      }}
    >
      <Camera size={18} style={{ color: dragging ? "var(--accent)" : "var(--text-subtle)" }} />
      <span style={{ fontSize: 9, color: "var(--text-subtle)", fontFamily: "var(--font-sans)" }}>Logo</span>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}
