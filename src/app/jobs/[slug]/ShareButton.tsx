"use client";

import { useState } from "react";
import { Copy, Check, Linkedin } from "lucide-react";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        onClick={handleCopy}
        className="btn btn-ghost btn-sm"
        style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-ghost btn-sm"
        title={`Share "${title}" on LinkedIn`}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <Linkedin size={13} /> LinkedIn
      </a>
    </div>
  );
}
