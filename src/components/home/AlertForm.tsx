"use client";

import { useState } from "react";

type Category = { id: string; label: string; slug: string };

export function AlertForm({ categories }: { categories: Category[] }) {
  const [email, setEmail] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/candidates/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), categoryId: categoryId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{ padding: "12px 0" }}>
        <p className="body-s" style={{ fontWeight: 600, color: "var(--success)", marginBottom: 4 }}>✓ You're subscribed!</p>
        <p className="body-s" style={{ color: "var(--text-muted)" }}>We'll send matching jobs to {email}.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        className="input"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
      />
      <select className="select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
        <option value="">All categories</option>
        {categories.slice(1).map(cat => (
          <option key={cat.id} value={cat.id}>{cat.label}</option>
        ))}
      </select>
      {errorMsg && <p className="body-s" style={{ color: "var(--error)" }}>{errorMsg}</p>}
      <button
        className="btn btn-accent"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={handleSubmit}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Subscribing…" : "Get alerts"}
      </button>
    </div>
  );
}
