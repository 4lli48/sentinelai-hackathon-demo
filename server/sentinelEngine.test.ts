import { describe, expect, it } from "vitest";
import { demoScenarios } from "../shared/sentinel";
import { deterministicReport, runDeterministicAnalysis } from "./sentinelEngine";

describe("SentinelAI deterministic engine", () => {
  it("keeps a safe transfer approved and keeps ML advisory", () => {
    const scenario = demoScenarios.find(item => item.id === "safe")!;
    const result = runDeterministicAnalysis(scenario.input);
    expect(result.decision).toBe("Approve");
    expect(result.score).toBe(0);
    expect(result.mlSignal.advisory).toBe(true);
    expect(result.audit).toHaveLength(14);
  });

  it("forces manual review for a high-risk website regardless of score mapping", () => {
    const scenario = demoScenarios.find(item => item.id === "website")!;
    const result = runDeterministicAnalysis(scenario.input);
    expect(result.website?.classification).toBe("High Risk");
    expect(result.decision).toBe("Manual Review");
    expect(result.policyOverride).toContain("cannot be bypassed");
    expect(result.alert.created).toBe(true);
  });

  it("freezes the pre-decision context in the analysis snapshot", () => {
    const scenario = demoScenarios.find(item => item.id === "laundering")!;
    const result = runDeterministicAnalysis(scenario.input);
    expect(result.snapshot.customer.transactionCount).toBe(9);
    expect(result.snapshot.derived.newBeneficiary).toBe(true);
    expect(result.snapshot.transaction.beneficiaryName).toBe("Global Trade FZE");
  });

  it("explains customer behaviour change and international transfer with deterministic additional verification", () => {
    const scenario = demoScenarios.find(item => item.id === "verify")!;
    const result = runDeterministicAnalysis(scenario.input);
    expect(result.snapshot.customer.nameAr).toBe("نورة الدوسري");
    expect(result.score).toBe(55);
    expect(result.decision).toBe("Additional Verification");
    expect(result.factors.map(factor => factor.id)).toEqual(expect.arrayContaining(["international-threshold", "behaviour"]));
    expect(result.mlSignal.advisory).toBe(true);
  });

  it("always has a non-empty deterministic report fallback", () => {
    const scenario = demoScenarios.find(item => item.id === "website")!;
    const report = deterministicReport(runDeterministicAnalysis(scenario.input));
    expect(report.evidence.length).toBeGreaterThan(0);
    expect(report.analysis.length).toBeGreaterThan(0);
    expect(report.references.length).toBeGreaterThan(0);
    expect(report.actions.length).toBeGreaterThan(0);
  });

  it("rejects an unknown customer instead of using another customer's baseline", () => {
    const scenario = demoScenarios.find(item => item.id === "safe")!;
    expect(() => runDeterministicAnalysis({ ...scenario.input, customerId: "unknown-customer" })).toThrow("Unknown SentinelAI customer profile: unknown-customer");
  });

  it.each([
    ["safe", "Approve"],
    ["verify", "Additional Verification"],
    ["website", "Manual Review"],
    ["laundering", "Manual Review"],
  ] as const)("returns the expected deterministic outcome for the %s demo scenario", (scenarioId, decision) => {
    const scenario = demoScenarios.find(item => item.id === scenarioId)!;
    const result = runDeterministicAnalysis(scenario.input);
    expect(result.decision).toBe(decision);
    expect(result.mlSignal.advisory).toBe(true);
    expect(result.audit).toHaveLength(14);
  });
});
