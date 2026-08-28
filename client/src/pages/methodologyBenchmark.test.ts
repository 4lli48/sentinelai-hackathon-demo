import { describe, it, expect } from "vitest";
import { runDecisionBenchmark } from "@shared/decisionBenchmark";

describe("Methodology Page Decision Quality Panel Validation", () => {
  it("provides structured evidence data for Methodology page rendering in AR and EN", () => {
    const report = runDecisionBenchmark();

    // Arabic assertions
    expect(report.title.ar).toBe("دليل جودة القرار والذكاء");
    expect(report.badge.ar).toBe("تحقق موثق");
    expect(report.explanation.ar).toContain("240 حالة مرجعية معلّمة");
    expect(report.disclaimer.ar).toContain("تُستخدم هذه الحالات المرجعية لقياس جودة القرار");

    // English assertions
    expect(report.title.en).toBe("Decision quality & AI traceability evidence");
    expect(report.badge.en).toBe("Documented verification");
    expect(report.explanation.en).toContain("240 version-pinned");
    expect(report.disclaimer.en).toContain("These benchmark cases are used exclusively");

    // Metric values presence
    expect(report.metrics.decisionPolicyAgreement).toBeDefined();
    expect(report.metrics.requiredReviewCapture).toBeDefined();
    expect(report.metrics.unneededEscalation).toBeDefined();

    // 5 Samples presence
    expect(report.sampleCases.length).toBe(5);
    report.sampleCases.forEach(sample => {
      expect(sample.expectedDecision).toBeDefined();
      expect(sample.engineDecision).toBeDefined();
      expect(sample.rulesScore).toBeGreaterThanOrEqual(0);
      expect(sample.behaviorScore).toBeGreaterThanOrEqual(0);
    });
  });
});
