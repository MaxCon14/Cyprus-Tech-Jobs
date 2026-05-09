"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function Select({
  name,
  options,
  defaultValue = "",
  value: controlledValue,
  placeholder = "Select…",
  icon,
  onChange,
  style,
  disabled,
}: SelectProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current    = isControlled ? controlledValue : internalValue;
  const label      = options.find(o => o.value === current)?.label ?? placeholder;
  const hasValue   = current !== "";

  // Sync uncontrolled state when defaultValue changes (e.g. edit form pre-fill)
  useEffect(() => {
    if (!isControlled) setInternalValue(defaultValue);
  }, [defaultValue, isControlled]);

  // Close on outside click
  useEffect(() => {
    function down(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, []);

  // Close on Escape
  useEffect(() => {
    function key(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);

  function pick(val: string) {
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      {/* Hidden input so native <form> submission works */}
      <input type="hidden" name={name} value={current} />

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        style={{
          width:        "100%",
          padding:      "10px 36px 10px 12px",
          font:         "400 14px/1.4 var(--font-sans)",
          color:        hasValue ? "var(--text)" : "var(--text-subtle)",
          background:   "var(--surface)",
          border:       `1px solid ${open ? "var(--accent)" : "var(--border-strong)"}`,
          borderRadius: "var(--radius-sm)",
          cursor:       disabled ? "not-allowed" : "pointer",
          textAlign:    "left",
          display:      "flex",
          alignItems:   "center",
          gap:          8,
          boxShadow:    open ? "0 0 0 3px var(--accent-soft)" : "none",
          transition:   "border-color 150ms, box-shadow 150ms",
          opacity:      disabled ? 0.5 : 1,
        }}
      >
        {icon && (
          <span style={{ color: "var(--text-subtle)", flexShrink: 0, display: "flex" }}>
            {icon}
          </span>
        )}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
        <ChevronDown
          size={14}
          style={{
            color:      "var(--text-subtle)",
            flexShrink: 0,
            transition: "transform 150ms",
            transform:  open ? "rotate(180deg)" : "rotate(0deg)",
            position:   "absolute",
            right:      12,
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position:   "absolute",
            top:        "calc(100% + 6px)",
            left:       0,
            right:      0,
            background: "var(--surface)",
            border:     "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            boxShadow:  "0 8px 24px rgba(0,0,0,0.12)",
            zIndex:     200,
            overflow:   "hidden",
            minWidth:   160,
          }}
        >
          {options.map(opt => {
            const isSelected = opt.value === current;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => pick(opt.value)}
                style={{
                  width:      "100%",
                  padding:    "10px 14px",
                  font:       "400 14px/1.4 var(--font-sans)",
                  color:      isSelected ? "var(--accent)" : "var(--text)",
                  background: isSelected ? "var(--accent-soft)" : "transparent",
                  border:     "none",
                  cursor:     "pointer",
                  textAlign:  "left",
                  display:    "flex",
                  alignItems: "center",
                  gap:        10,
                  transition: "background 100ms",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-muted)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isSelected && <Check size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
