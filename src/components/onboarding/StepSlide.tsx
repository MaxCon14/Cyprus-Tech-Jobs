"use client";

import { useEffect, useRef, useState } from "react";
import type { WizardDirection } from "@/lib/onboarding-types";

interface Props {
  direction: WizardDirection;
  children: React.ReactNode;
}

export function StepSlide({ direction, children }: Props) {
  const [entered, setEntered] = useState(false);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const startX = direction === "forward" ? "48px" : "-48px";

  return (
    <div
      style={{
        transform: entered ? "translateX(0) scale(1)" : `translateX(${startX}) scale(0.99)`,
        opacity: entered ? 1 : 0,
        transition: entered
          ? "transform 350ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease"
          : "none",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
