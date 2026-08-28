import { describe, it, expect } from "vitest";
import {
  BENCHMARK_CASES,
  BENCHMARK_CATEGORIES,
  BENCHMARK_TOTAL_CASES,
  DECISION_BENCHMARK_VERSION,
  runDecisionBenchmark,
} from "./decisionBenchmark";
import fs from "fs";
import path from "path";

describe("Decision Benchmark & Policy Quality Evidence", () => {
  it("defines exactly 240 version-pinned benchmark cases", () => {
    expect(BENCHMARK_TOTAL_CASES).toBe(240);
    expect(BENCHMARK_CASES.length).toBe(240);
    expect(DECISION_BENCHMARK_VERSION).toBe("1.0.0");
  });

  it("ensures all 240 benchmark case IDs are unique and correctly prefixed", () => {
    const ids = BENCHMARK_CASES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(240);

    BENCHMARK_CASES.forEach((c, index) => {
      const expectedId = "BENCH-" + String(index + 1).padStart(3, "0");
      expect(c.id).toBe(expectedId);
    });
  });

  it("covers all 5 target categories with expected distributions", () => {
    const categoryCounts: Record<string, number> = {};
    for (const c of BENCHMARK_CASES) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }

    expect(categoryCounts["standard_normal"]).toBe(60);
    expect(categoryCounts["additional_verification"]).toBe(50);
    expect(categoryCounts["mandatory_policy"]).toBe(40);
    expect(categoryCounts["compound_aml"]).toBe(50);
    expect(categoryCounts["policy_boundary"]).toBe(40);

    const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(240);
  });

  it("runs evaluation deterministically across repeated executions", () => {
    const run1 = runDecisionBenchmark();
    const run2 = runDecisionBenchmark();

    expect(run1.version).toBe(run2.version);
    expect(run1.metrics.totalCases).toBe(240);
    expect(run1.metrics.decisionPolicyAgreement).toBe(run2.metrics.decisionPolicyAgreement);
    expect(run1.metrics.requiredReviewCapture).toBe(run2.metrics.requiredReviewCapture);
    expect(run1.metrics.unneededEscalation).toBe(run2.metrics.unneededEscalation);
    expect(run1.sampleCases.length).toBe(5);
    expect(run1.sampleCases).toEqual(run2.sampleCases);
  });

  it("computes agreement, required-review capture, and unneeded escalation accurately from actual outcomes", () => {
    const report = runDecisionBenchmark();
    const { metrics, sampleCases } = report;

    expect(metrics.totalCases).toBe(240);
    expect(metrics.decisionPolicyAgreement).toBeGreaterThanOrEqual(90);
    expect(metrics.requiredReviewCapture).toBeGreaterThanOrEqual(95);
    expect(metrics.unneededEscalation).toBeLessThanOrEqual(5);

    expect(sampleCases.length).toBe(5);
    sampleCases.forEach((sample) => {
      expect(sample.id).toBeDefined();
      expect(sample.category).toBeDefined();
      expect(sample.expectedDecision).toBeDefined();
      expect(sample.engineDecision).toBeDefined();
      expect(typeof sample.rulesScore).toBe("number");
      expect(typeof sample.behaviorScore).toBe("number");
    });
  });

  it("statically verifies that decisionBenchmark.ts does NOT import Supabase or database mutation modules", () => {
    const filePath = path.resolve(__dirname, "./decisionBenchmark.ts");
    const source = fs.readFileSync(filePath, "utf8");

    expect(source).not.toContain("@supabase");
    expect(source).not.toContain("sentinelSupabase");
    expect(source).not.toContain("persistAnalysisResult");
    expect(source).not.toContain("persistChatExchange");
    expect(source).not.toContain("drizzle");
  });

  it("contains all required bilingual metadata and verification disclaimers", () => {
    const report = runDecisionBenchmark();

    expect(report.title.ar).toBe("دليل جودة القرار والذكاء");
    expect(report.title.en).toBe("Decision quality & AI traceability evidence");
    expect(report.badge.ar).toBe("تحقق موثق");
    expect(report.badge.en).toBe("Documented verification");

    expect(report.explanation.ar).toContain("240 حالة مرجعية");
    expect(report.explanation.en).toContain("240 version-pinned");

    expect(report.disclaimer.ar).toContain("لا تدخل سجل العملاء أو خط الأساس");
    expect(report.disclaimer.en).toContain("do not enter customer records, baselines");
  });
});
