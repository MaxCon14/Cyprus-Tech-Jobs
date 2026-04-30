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
        <div className="wizard-layout">
          {/* Form panel */}
          <div style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
            <div style={{ maxWidth: 540, margin: "0 auto", padding: "clamp(32px, 5vw, 52px) var(--page-padding-x) 100px" }}>
              {children}
            </div>
          </div>

          {/* Preview panel — hidden on mobile */}
          <div className="wizard-side-panel">
            {sidePanel}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ maxWidth: 600, width: "100%", margin: "0 auto", padding: "clamp(32px, 5vw, 52px) var(--page-padding-x) 100px", overflowX: "hidden" }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
