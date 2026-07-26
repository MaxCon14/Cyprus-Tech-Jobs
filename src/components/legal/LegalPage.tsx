import Link from "next/link";
import { LAST_UPDATED } from "@/lib/legal";

/**
 * Shell + block renderer shared by /terms, /privacy and /cookies.
 *
 * Content arrives as data rather than JSX because legal prose is full of
 * apostrophes and quotes, which `react/no-unescaped-entities` rejects in
 * literal JSX text. Strings inside expressions are exempt, so the documents
 * stay readable in source instead of being peppered with &apos;.
 */

export type Block =
  | { type: "p";     text: string }
  | { type: "h3";    text: string }
  | { type: "ul";    items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "note";  text: string };

export interface LegalSection {
  id: string;
  heading: string;
  blocks: Block[];
}

const linkStyle = { color: "var(--accent)", textDecoration: "none" };

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h3":
      return (
        <h3 className="h3" style={{ margin: "26px 0 10px", color: "var(--text)" }}>
          {block.text}
        </h3>
      );

    case "p":
      return (
        <p className="body" style={{ color: "var(--text-muted)", margin: "0 0 14px" }}>
          {block.text}
        </p>
      );

    case "ul":
      return (
        <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: "0 0 16px", padding: 0, listStyle: "none" }}>
          {block.items.map((item, i) => (
            <li key={i} className="body" style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--text-muted)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 9 }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "note":
      return (
        <div style={{
          background: "var(--bg-muted)",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--accent)",
          borderRadius: 10,
          padding: "14px 16px",
          margin: "0 0 16px",
        }}>
          <p className="body-s" style={{ color: "var(--text-muted)", margin: 0 }}>{block.text}</p>
        </div>
      );

    case "table":
      return (
        /* Wide tables scroll inside their own box so the page body never
           scrolls sideways on a phone. */
        <div style={{ overflowX: "auto", margin: "0 0 18px", border: "1px solid var(--border)", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                {block.head.map(h => (
                  <th key={h} className="caption" style={{
                    textAlign: "left", padding: "11px 14px", color: "var(--text-subtle)",
                    background: "var(--bg-alt)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="body-s" style={{
                      padding: "12px 14px", color: ci === 0 ? "var(--text)" : "var(--text-muted)",
                      fontWeight: ci === 0 ? 600 : 400,
                      borderBottom: ri === block.rows.length - 1 ? "none" : "1px solid var(--border)",
                      verticalAlign: "top",
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

const SIBLINGS = [
  { href: "/terms",   label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;

export function LegalPage({
  eyebrow, title, intro, sections, current,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  /** This page's own path, so the footer links to the other two only. */
  current: "/terms" | "/privacy" | "/cookies";
}) {
  const others = SIBLINGS.filter(s => s.href !== current);
  return (
    <section style={{ padding: "clamp(48px, 7vw, 80px) 0", background: "var(--bg-alt)", minHeight: "100vh" }}>
      <div className="page-container">
        <div style={{ maxWidth: 780, margin: "0 auto" }}>

          <div style={{ marginBottom: "clamp(24px, 3vw, 36px)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>{eyebrow}</div>
            <h1 className="display-m" style={{ marginBottom: 12 }}>{title}</h1>
            <p className="body" style={{ color: "var(--text-muted)", marginBottom: 10 }}>{intro}</p>
            <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
              {`LAST UPDATED ${LAST_UPDATED.toUpperCase()}`}
            </p>
          </div>

          {/* Contents — these documents are long enough that landing at the top
              with no map is its own accessibility problem. */}
          <nav
            aria-label="On this page"
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "18px 20px", marginBottom: "clamp(28px, 4vw, 40px)",
            }}
          >
            <p className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>On this page</p>
            <ol style={{ display: "flex", flexDirection: "column", gap: 7, margin: 0, padding: 0, listStyle: "none" }}>
              {sections.map((s, i) => (
                <li key={s.id} style={{ display: "flex", gap: 10 }}>
                  <span className="mono-s" style={{ color: "var(--text-subtle)", flexShrink: 0, minWidth: 20 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a href={`#${s.id}`} className="body-s" style={{ ...linkStyle, color: "var(--text)" }}>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              style={{ scrollMarginTop: 90, marginBottom: "clamp(30px, 4vw, 44px)" }}
            >
              <h2 className="h2" style={{ marginBottom: 14 }}>
                <span className="mono-s" style={{ color: "var(--text-subtle)", marginRight: 10 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.heading}
              </h2>
              {s.blocks.map((b, bi) => <BlockView key={bi} block={b} />)}
            </section>
          ))}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 8 }}>
            <p className="body-s" style={{ color: "var(--text-subtle)" }}>
              {"See also "}
              <Link href={others[0].href} style={linkStyle}>{others[0].label}</Link>
              {" and "}
              <Link href={others[1].href} style={linkStyle}>{others[1].label}</Link>
              {"."}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
