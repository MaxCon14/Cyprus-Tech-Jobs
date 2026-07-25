import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Style guide — CyprusTech.Careers",
  description: "Design tokens, type scale and components used across CyprusTech.Careers.",
  // Internal reference page — must never compete in search.
  robots: { index: false, follow: false },
};

/* Every swatch and specimen below is driven by the real custom properties in
   globals.css, so this page restyles itself whenever a token changes. Hex
   values are shown only for the raw ramps, where the literal is the token. */

const PINK = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
const PINK_HEX: Record<string, string> = {
  "50": "#FFF4F8", "100": "#FFE8F0", "200": "#FFCDDC", "300": "#FF9BBA", "400": "#FF6B9D",
  "500": "#FF3D7F", "600": "#E6336F", "700": "#B8285A", "800": "#8A1E44", "900": "#5C142D",
};
const NEUTRAL = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
const NEUTRAL_HEX: Record<string, string> = {
  "50": "#FAFAF9", "100": "#F5F4F2", "200": "#E8E6E1", "300": "#D4D1CA", "400": "#A3A09A",
  "500": "#737069", "600": "#525049", "700": "#3A3933", "800": "#1F1E1A", "900": "#0A0A0A",
};

const SEMANTIC: [string, string][] = [
  ["--bg", "white / neutral-950"],
  ["--bg-alt", "neutral-50 / neutral-900"],
  ["--bg-muted", "neutral-100"],
  ["--surface", "white / neutral-800"],
  ["--border", "neutral-200 / neutral-700"],
  ["--border-strong", "neutral-300"],
  ["--text", "black / white"],
  ["--text-muted", "neutral-600 / neutral-300"],
  ["--text-subtle", "neutral-400"],
  ["--accent", "pink-500"],
  ["--accent-hover", "pink-600"],
  ["--accent-soft", "pink-100 / pink tint"],
];

const STATUS: [string, string][] = [
  ["--success", "--success-bg"],
  ["--warning", "--warning-bg"],
  ["--error", "--error-bg"],
  ["--info", "--info-bg"],
];

const TYPE: [string, string][] = [
  ["display-l", "600 · 44/48 · -0.02em · clamps to 28px"],
  ["display-m", "600 · 32/38 · -0.015em · clamps to 24px"],
  ["h1", "600 · 28/34 · -0.01em"],
  ["h2", "600 · 22/28 · -0.01em"],
  ["h3", "500 · 18/24 · -0.005em"],
  ["body-l", "400 · 17/26"],
  ["body", "400 · 15/22"],
  ["body-s", "400 · 13/18"],
  ["caption", "500 · 12/16 · uppercase · 0.06em"],
  ["mono-l", "400 · 14/20 · Fragment Mono"],
  ["mono", "400 · 12/16 · Fragment Mono"],
  ["mono-s", "400 · 11/14 · Fragment Mono"],
];

const RADII = ["xs", "sm", "md", "lg", "xl", "full"];
const SHADOWS = ["sm", "md", "lg"];

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <h2 className="h2" style={{ marginBottom: note ? 6 : 20 }}>{title}</h2>
      {note && <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 20, maxWidth: 620 }}>{note}</p>}
      {children}
    </section>
  );
}

function Token({ name }: { name: string }) {
  return (
    <span className="mono-s" style={{ color: "var(--text-muted)" }}>{name}</span>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="page-container" style={{ paddingBlock: "clamp(32px, 5vw, 56px)", maxWidth: 900 }}>

      <header style={{ marginBottom: 56 }}>
        <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>INTERNAL REFERENCE</div>
        <h1 className="display-m" style={{ marginBottom: 12 }}>Style guide</h1>
        <p className="body" style={{ color: "var(--text-muted)", maxWidth: 620 }}>
          The tokens and classes defined in <Token name="src/app/globals.css" />. Everything here is
          rendered with the live values, so this page stays correct when the tokens change. Dark mode
          is driven by <Token name='[data-theme="dark"]' /> on the root element, not by the OS setting.
        </p>
      </header>

      <Section title="Colour — brand ramp" note="The pink ramp. --accent is pink-500; --accent-hover is pink-600.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(78px, 1fr))", gap: 8 }}>
          {PINK.map(step => (
            <div key={step}>
              <div style={{ background: `var(--pink-${step})`, height: 56, borderRadius: 8, border: "1px solid var(--border)" }} />
              <div className="mono-s" style={{ marginTop: 6 }}>{step}</div>
              <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{PINK_HEX[step]}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Colour — neutrals" note="Warm-tinted greys. Every surface, border and text colour resolves to one of these.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(78px, 1fr))", gap: 8 }}>
          {NEUTRAL.map(step => (
            <div key={step}>
              <div style={{ background: `var(--neutral-${step})`, height: 56, borderRadius: 8, border: "1px solid var(--border)" }} />
              <div className="mono-s" style={{ marginTop: 6 }}>{step}</div>
              <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{NEUTRAL_HEX[step]}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic tokens" note="Use these in components, not the raw ramps — they carry the light/dark switch.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {SEMANTIC.map(([token, alias]) => (
            <div key={token} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", background: "var(--surface)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: `var(${token})`, border: "1px solid var(--border-strong)", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div className="mono-s">{token}</div>
                <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{alias}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Status colours">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {STATUS.map(([fg, bg]) => (
            <div key={fg} style={{ background: `var(${bg})`, border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
              <div className="mono-s" style={{ color: `var(${fg})`, fontWeight: 600 }}>{fg}</div>
              <div className="mono-s" style={{ color: `var(${fg})`, opacity: 0.75 }}>{bg}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography" note="Figtree for everything except the mono scale, which is Fragment Mono. Display sizes clamp down on small screens.">
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {TYPE.map(([cls, spec], i) => (
            <div key={cls} style={{
              display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20,
              padding: "16px 18px", flexWrap: "wrap",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
              background: "var(--surface)",
            }}>
              <div className={cls}>Find roles in your speciality</div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="mono-s" style={{ color: "var(--text)" }}>.{cls}</div>
                <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{spec}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons" note="Combine one variant with an optional size. btn-accent is the primary call to action; use one per view.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <span className="btn btn-accent">btn-accent</span>
          <span className="btn btn-primary">btn-primary</span>
          <span className="btn btn-outline">btn-outline</span>
          <span className="btn btn-ghost">btn-ghost</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <span className="btn btn-accent btn-lg">btn-lg</span>
          <span className="btn btn-accent">default</span>
          <span className="btn btn-accent btn-sm">btn-sm</span>
        </div>
      </Section>

      <Section title="Radii">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {RADII.map(r => (
            <div key={r} style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 56, background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: `var(--radius-${r})` }} />
              <div className="mono-s" style={{ marginTop: 6, color: "var(--text-muted)" }}>{r}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Elevation">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {SHADOWS.map(s => (
            <div key={s} style={{ width: 150, height: 76, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: `var(--shadow-${s})`, display: "grid", placeItems: "center" }}>
              <span className="mono-s" style={{ color: "var(--text-muted)" }}>shadow-{s}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Layout" note="Page width and gutters are tokens too — use .page-container rather than setting them by hand.">
        <div style={{ display: "grid", gap: 10 }}>
          {[["--page-max-w", "1200px"], ["--page-padding-x", "clamp(16px, 4vw, 40px)"], ["--ease-out", "cubic-bezier(0.16, 1, 0.3, 1)"]].map(([t, v]) => (
            <div key={t} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", flexWrap: "wrap" }}>
              <span className="mono-s">{t}</span>
              <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}
