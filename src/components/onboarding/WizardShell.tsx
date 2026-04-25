"use client";

import { StepIndicator } from "./StepIndicator";

interface Props {
  steps: string[];
  currentStep: number;
  children: React.ReactNode;
  sidePanel?: React.ReactNode;
}

export function WizardShell({ steps, currentStep, children, sidePanel }: Props) {
  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      {sidePanel ? (
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 80px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 52, alignItems: "start" }}>
          <div style={{ minWidth: 0, overflowX: "hidden" }}>{children}</div>
          <div>{sidePanel}</div>
        </div>
      ) : (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px", overflowX: "hidden" }}>
          {children}
        </div>
      )}
    </>
  );
}
