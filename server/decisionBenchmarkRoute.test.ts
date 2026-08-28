import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Sentinel Decision Quality Evidence TRPC Route", () => {
  it("provides read-only access to decision quality evidence via TRPC caller", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const evidence = await caller.sentinel.decisionQualityEvidence();

    expect(evidence).toBeDefined();
    expect(evidence.version).toBe("1.0.0");
    expect(evidence.metrics.totalCases).toBe(240);
    expect(evidence.metrics.decisionPolicyAgreement).toBeGreaterThanOrEqual(90);
    expect(evidence.metrics.requiredReviewCapture).toBeGreaterThanOrEqual(95);
    expect(evidence.metrics.unneededEscalation).toBeLessThanOrEqual(5);
    expect(evidence.sampleCases.length).toBe(5);
    expect(evidence.badge.ar).toBe("تحقق موثق");
    expect(evidence.badge.en).toBe("Documented verification");
  });
});
