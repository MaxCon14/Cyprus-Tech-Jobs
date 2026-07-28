"use client";

import { useId, useRef, useState } from "react";
import { Info } from "lucide-react";

/* A small "ⓘ" trigger that reveals a box of explanatory text on hover, focus or
 * tap. Used to lift long helper copy out of the forms so the fields themselves
 * stay scannable — the detail is one hover away instead of always on screen.
 *
 * The panel is positioned `fixed`, measured from the icon when it opens. That is
 * deliberate: the form sections it sits in are `overflow: hidden` rounded cards,
 * and an absolutely-positioned panel would be clipped at the card edge. Fixed
 * positioning escapes both the overflow and any stacking context.
 *
 * Accessible: the trigger is a real button (keyboard-focusable, opens on focus)
 * and the panel is wired up with aria-describedby. It carries only text, so
 * closing when the pointer leaves the icon is fine — nothing to reach inside. */
interface Props {
  children:   React.ReactNode;
  /** Accessible name for the trigger, e.g. "About salary ranges". */
  label?:     string;
  /** Which edge of the panel lines up with the icon, so a tip near the right of
   *  the form can open leftwards and stay on screen. Default "left". */
  align?:     "left" | "right" | "center";
  /** Above or below the icon. Default "top". */
  side?:      "top" | "bottom";
}

export function InfoTip({ children, label = "More information", align = "left", side = "top" }: Props) {
  const [pos, setPos] = useState<React.CSSProperties | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const open = pos !== null;

  function openTip() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const s: React.CSSProperties = { position: "fixed", zIndex: 300 };
    if (side === "top") s.bottom = window.innerHeight - r.top + 8;
    else                s.top    = r.bottom + 8;
    if (align === "left")       s.left  = Math.max(8, r.left - 6);
    else if (align === "right") s.right = Math.max(8, window.innerWidth - r.right - 6);
    else { s.left = r.left + r.width / 2; s.transform = "translateX(-50%)"; }
    setPos(s);
  }
  const closeTip = () => setPos(null);

  return (
    <span style={{ display: "inline-flex", verticalAlign: "middle" }}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onMouseEnter={openTip}
        onMouseLeave={closeTip}
        onFocus={openTip}
        onBlur={closeTip}
        onClick={() => (open ? closeTip() : openTip())}
        style={{
          all: "unset", display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: "50%", cursor: "pointer",
          color: open ? "var(--accent)" : "var(--text-subtle)", transition: "color 120ms",
        }}
      >
        <Info size={14} strokeWidth={2} aria-hidden />
      </button>

      {open && (
        <span
          role="tooltip"
          id={id}
          style={{
            ...pos,
            width: "max-content", maxWidth: 260,
            background: "var(--surface)", color: "var(--text)",
            border: "1px solid var(--border)", borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            padding: "10px 12px", fontFamily: "var(--font-sans)", fontSize: 12.5,
            lineHeight: 1.5, fontWeight: 400, textAlign: "left", whiteSpace: "normal",
            pointerEvents: "none",
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
}
