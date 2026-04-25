"use client";

import { Globe, MapPin } from "lucide-react";
import { ProfileRing } from "./ProfileRing";

const SIZE_LABELS: Record<string, string> = {
  startup: "Startup · 1–50",
  scaleup: "Scale-up · 51–250",
  enterprise: "Enterprise · 251+",
  agency: "Agency",
};

interface Props {
  name: string;
  logoUrl: string;
  city: string;
  website: string;
  size: string;
  description: string;
  techStack: string[];
  score: number;
  nextTip: string | null;
}

export function CompanyPreviewCard({ name, logoUrl, city, website, size, description, techStack, score, nextTip }: Props) {
  const displayName = name || "Your Company";

  return (
    <div style={{ position: "sticky", top: 24 }}>
      <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12 }}>
        LIVE PREVIEW
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", background: "var(--surface)", boxShadow: "0 8px 40px rgba(0,0,0,0.07)", transition: "box-shadow 300ms ease" }}>

        {/* Card header */}
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 10, background: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0, transition: "all 300ms" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, fontFamily: "var(--font-sans)" }}>
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 6, transition: "all 200ms" }}>
              {displayName}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {city && (
                <span className="tag" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={9} /> {city}
                </span>
              )}
              {size && <span className="tag">{SIZE_LABELS[size] ?? size}</span>}
              {website && (
                <span className="tag tag-outline" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Globe size={9} /> {website}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: "0 20px 16px" }}>
          {description ? (
            <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
              {description.slice(0, 140)}{description.length > 140 ? "…" : ""}
            </p>
          ) : (
            <p className="body-s" style={{ color: "var(--text-subtle)", fontStyle: "italic", margin: 0 }}>
              Add a description to tell candidates about your company…
            </p>
          )}
        </div>

        {/* Tech stack */}
        {techStack.length > 0 && (
          <div style={{ padding: "0 20px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {techStack.slice(0, 5).map(t => (
              <span key={t} className="tag tag-outline" style={{ fontSize: 11 }}>{t}</span>
            ))}
            {techStack.length > 5 && (
              <span className="tag" style={{ fontSize: 11 }}>+{techStack.length - 5}</span>
            )}
          </div>
        )}

        {/* Mock job listing teaser */}
        <div style={{ margin: "0 20px 16px", padding: "10px 14px", background: "var(--bg-alt)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12, color: "var(--text-subtle)", marginBottom: 4 }}>YOUR FIRST JOB LISTING</div>
          <div style={{ height: 8, background: "var(--bg-muted)", borderRadius: 4, width: "70%", marginBottom: 6 }} />
          <div style={{ height: 6, background: "var(--bg-muted)", borderRadius: 4, width: "45%" }} />
        </div>

        {/* Completion footer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 20px", background: "var(--bg-alt)", display: "flex", alignItems: "center", gap: 14 }}>
          <ProfileRing score={score} size={52} strokeWidth={5} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 3 }}>
              {score < 40 ? "Just getting started" : score < 70 ? "Profile looking good" : score < 90 ? "Almost complete" : "Profile complete!"}
            </div>
            {nextTip && (
              <div className="body-s" style={{ color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                ↑ {nextTip}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
