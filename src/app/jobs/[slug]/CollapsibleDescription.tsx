"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const MOBILE_QUERY  = "(max-width: 768px)";
const THRESHOLD_PX  = 460; // only collapse when the description is taller than this
const PREVIEW_PX    = 320; // how much stays visible when collapsed — enough to read into it

/** Wraps the job description. On mobile, if the content runs longer than the
 *  threshold it collapses to a readable preview with a fade + "Read more",
 *  so long listings don't force endless scrolling. Desktop always shows full. */
export function CollapsibleDescription({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile,    setIsMobile]    = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [expanded,    setExpanded]    = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollHeight > THRESHOLD_PX);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const collapsed = isMobile && overflowing && !expanded;
  const showToggle = isMobile && overflowing;

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          position: "relative",
          maxHeight: collapsed ? PREVIEW_PX : "none",
          overflow:  collapsed ? "hidden" : "visible",
        }}
      >
        {children}
        {collapsed && (
          <div
            aria-hidden
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0, height: 96,
              background: "linear-gradient(to bottom, transparent, var(--surface))",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          style={{
            marginTop: 16, width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "11px", borderRadius: 10,
            border: "1px solid var(--border-strong)", background: "var(--bg-alt)",
            color: "var(--accent)", cursor: "pointer",
            fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14,
          }}
        >
          {expanded ? "Show less" : "Read full description"}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  );
}
