import type { Metadata } from "next";
import { Mail, Clock, MessageSquare } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact us — CyprusTech.Jobs",
  description: "Get in touch with the CyprusTech.Jobs team. We're here to help with any questions about job listings, employer accounts, or the platform.",
};

export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "clamp(48px, 8vw, 80px) var(--page-padding-x)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p className="mono-s" style={{ color: "var(--accent)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Get in touch
          </p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "clamp(28px, 5vw, 40px)", color: "var(--text)", lineHeight: 1.15, marginBottom: 16 }}>
            How can we help?
          </h1>
          <p className="body" style={{ color: "var(--text-muted)", maxWidth: 480, lineHeight: 1.65 }}>
            Whether you have a question about posting a job, a technical issue, or just want to say hello — drop us a message and we'll get back to you quickly.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }} className="contact-layout">

          {/* Form */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "clamp(24px, 4vw, 36px)" }}>
            <ContactForm />
          </div>

          {/* Info sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Mail size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Email us directly</p>
                  <a href="mailto:help@cyprustech.careers" className="body-s" style={{ color: "var(--accent)", textDecoration: "none" }}>
                    help@cyprustech.careers
                  </a>
                </div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Clock size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Response time</p>
                  <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                    We aim to reply within one business day.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <MessageSquare size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="body-s" style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Common topics</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                    {["Posting a job listing", "Billing & slots", "Candidate accounts", "Technical issues", "Partnerships"].map(t => (
                      <li key={t} className="body-s" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, display: "inline-block" }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .contact-layout { grid-template-columns: 1fr !important; }
          .contact-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
