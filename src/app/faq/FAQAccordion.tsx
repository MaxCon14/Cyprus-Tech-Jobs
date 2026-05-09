"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
}

function Accordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%", textAlign: "left", background: isOpen ? "var(--bg-muted, #f9fafb)" : "var(--surface)",
                border: "none", cursor: "pointer", padding: "18px 22px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              }}
            >
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, color: "var(--text)", lineHeight: 1.4 }}>
                {item.q}
              </span>
              <ChevronDown
                size={16}
                style={{
                  color: "var(--text-muted)", flexShrink: 0,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 200ms ease",
                }}
              />
            </button>
            {isOpen && (
              <div style={{ padding: "0 22px 20px", background: "var(--bg-muted, #f9fafb)" }}>
                <div className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                  {item.a}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface Section {
  title: string;
  items: FAQItem[];
}

export function FAQAccordion({ sections }: { sections: Section[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {sections.map(section => (
        <div key={section.title}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 16 }}>
            {section.title}
          </h2>
          <Accordion items={section.items} />
        </div>
      ))}
    </div>
  );
}
