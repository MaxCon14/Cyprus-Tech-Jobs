"use client";

import { StepIndicator } from "./StepIndicator";

interface Props {
  steps: string[];
  currentStep: number; // 0-indexed
  children: React.ReactNode;
}

export function WizardShell({ steps, currentStep, children }: Props) {
  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "48px 24px 80px",
          overflowX: "hidden",
        }}
      >
        {children}
      </div>
    </>
  );
}
