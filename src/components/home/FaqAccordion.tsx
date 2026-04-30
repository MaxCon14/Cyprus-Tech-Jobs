"use client";

import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { q: string; a: string };

function FaqRow({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="faq-item">
      <button className="faq-summary" onClick={onToggle} aria-expanded={isOpen}>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "clamp(15px, 2vw, 16px)", color: "var(--text)", textAlign: "left" }}>
          {q}
        </span>
        <ChevronDown size={16} className={`faq-chevron${isOpen ? " open" : ""}`} />
      </button>

      <div
        style={{
          maxHeight: isOpen ? `${innerRef.current?.scrollHeight ?? 400}px` : "0px",
          overflow: "hidden",
          transition: "max-height 380ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div ref={innerRef} className="faq-body">
          <p className="body" style={{ color: "var(--text-muted)", lineHeight: 1.75 }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {faqs.map((faq, i) => (
        <FaqRow
          key={i}
          q={faq.q}
          a={faq.a}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
