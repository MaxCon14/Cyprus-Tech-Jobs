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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 60px)" }}>
      <StepIndicator steps={steps} currentStep={currentStep} />

      {sidePanel ? (
        <div style={{ display: "flex", flex: 1 }}>
          {/* Form panel */}
          <div style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
            <div style={{ maxWidth: 540, margin: "0 auto", padding: "52px 40px 100px" }}>
              {children}
            </div>
          </div>

          {/* Preview panel */}
          <div style={{
            width: 420,
            flexShrink: 0,
            background: "var(--neutral-50)",
            borderLeft: "1px solid var(--border)",
            padding: "40px 32px 100px",
          }}>
            {sidePanel}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ maxWidth: 600, width: "100%", margin: "0 auto", padding: "52px 24px 100px", overflowX: "hidden" }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
