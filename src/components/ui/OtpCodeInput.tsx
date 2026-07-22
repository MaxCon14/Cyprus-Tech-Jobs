"use client";

import { useRef, KeyboardEvent, ClipboardEvent } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpCodeInput({ value, onChange, disabled, autoFocus }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const digits = value.split("").concat(Array(8).fill("")).slice(0, 8);

  function focusBox(idx: number) {
    const inputs = containerRef.current?.querySelectorAll("input");
    inputs?.[idx]?.focus();
  }

  function handleChange(idx: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[idx] = digit;
    const newVal = next.join("").replace(/\s/g, "");
    onChange(newVal);
    if (digit && idx < 7) focusBox(idx + 1);
  }

  function handleKey(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = digits.slice();
        next[idx] = "";
        onChange(next.join(""));
      } else if (idx > 0) {
        focusBox(idx - 1);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focusBox(idx - 1);
    } else if (e.key === "ArrowRight" && idx < 7) {
      focusBox(idx + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    onChange(pasted);
    focusBox(Math.min(pasted.length, 7));
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
        gap: "clamp(4px, 1.5vw, 8px)",
        width: "100%",
        maxWidth: 424,
        margin: "0 auto",
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={digits[i]}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          style={{
            width: "100%",
            minWidth: 0,
            aspectRatio: "46 / 54",
            textAlign: "center",
            fontSize: "clamp(16px, 5vw, 22px)",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            letterSpacing: 0,
            padding: 0,
            border: `1.5px solid ${digits[i] ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 10,
            background: digits[i] ? "var(--accent-soft)" : "var(--bg)",
            color: "var(--text)",
            outline: "none",
            transition: "border-color 150ms, background 150ms",
            caretColor: "var(--accent)",
            boxSizing: "border-box",
          }}
        />
      ))}
    </div>
  );
}
