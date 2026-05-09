"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

type Step = "idle" | "loading" | "done" | "error";

const SUBJECTS = [
  "General enquiry",
  "Employer / posting a job",
  "Technical issue",
  "Partnership",
  "Other",
];

export function ContactForm() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [step,    setStep]    = useState<Step>("idle");
  const [err,     setErr]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setStep("loading");

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setStep("done");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep("error");
    }
  }

  if (step === "done") {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <Check size={24} style={{ color: "var(--accent)" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 10 }}>
          Message sent!
        </h2>
        <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
          Thanks for reaching out. We'll get back to you at <strong>{email}</strong> within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="contact-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your name
          </label>
          <input
            className="input"
            type="text"
            placeholder="Maria Georgiou"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your email
          </label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Subject
        </label>
        <select
          className="select"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        >
          <option value="">Select a topic…</option>
          {SUBJECTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label className="mono-s" style={{ color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Message
        </label>
        <textarea
          className="input"
          placeholder="How can we help?"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={6}
          style={{ resize: "vertical", minHeight: 140, fontFamily: "inherit" }}
        />
        <span className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "right" }}>
          {message.length}/5000
        </span>
      </div>

      {err && (
        <p className="body-s" style={{ color: "var(--error, #ef4444)", margin: 0 }}>{err}</p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={step === "loading"}
        style={{ justifyContent: "center", alignSelf: "flex-start", minWidth: 160 }}
      >
        {step === "loading"
          ? "Sending…"
          : <><Send size={14} /> Send message</>
        }
      </button>

    </form>
  );
}
