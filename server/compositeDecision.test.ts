import { describe, expect, it } from "vitest";
import type { AiDecisionRecommendation, AnalysisResult } from "../shared/sentinel";
import { applyCompositeDecision, composeDecision } from "./compositeDecision";

function baseResult(overrides: Partial<AnalysisResult> = {}) {
  const ruleAssessment = { score: 15, riskLevel: "Low" as const, decision: "Approve" as const };
  return {
    score: ruleAssessment.score,
    riskLevel: ruleAssessment.riskLevel,
    decision: ruleAssessment.decision,
    ruleAssessment,
    compositeDecision: { ruleAssessment, finalScore: 15, finalRiskLevel: "Low" as const, finalDecision: "Approve" as const, outcome: "awaiting_ai" as const, rationale: "", rationaleAr: "" },
    factors: [],
    mlSignal: { level: "Routine" } as AnalysisResult["mlSignal"],
    audit: [],
    alert: { created: false },
    case: { created: false, status: "Not required" as const },
    ...overrides,
  } as Omit<AnalysisResult, "report">;
}

function recommendation(decision: AiDecisionRecommendation["decision"], score: number): AiDecisionRecommendation {
  return { availability: "available", decision, riskLevel: score >= 61 ? "High" : score >= 31 ? "Medium" : "Low", score, confidence: 82, rationale: "Evidence warrants this recommendation.", reviewItems: ["Verify beneficiary context."] };
}

describe("سياسة القرار المركب", () => {
  it("تسمح لتوصية الذكاء برفع عملية مقبولة عند وجود إشارة سلوك مادية", () => {
    const composed = composeDecision(baseResult({ mlSignal: { level: "Elevated" } as AnalysisResult["mlSignal"] }), recommendation("Additional Verification", 48));
    expect(composed.finalDecision).toBe("Additional Verification");
    expect(composed.outcome).toBe("ai_escalated");
    expect(composed.finalScore).toBe(48);
  });

  it("يمنع تصعيد الذكاء لتحويل اعتيادي بلا عوامل وإشارة سلوك اعتيادية", () => {
    const composed = composeDecision(baseResult(), recommendation("Additional Verification", 52));
    expect(composed.finalDecision).toBe("Approve");
    expect(composed.finalRiskLevel).toBe("Low");
    expect(composed.outcome).toBe("rule_guardrail");
  });

  it("تمنع توصية الذكاء الأخف من خفض حد القواعد", () => {
    const ruleAssessment = { score: 70, riskLevel: "High" as const, decision: "Temporary Hold" as const };
    const composed = composeDecision(baseResult({ score: 70, riskLevel: "High", decision: "Temporary Hold", ruleAssessment }), recommendation("Approve", 10));
    expect(composed.finalDecision).toBe("Temporary Hold");
    expect(composed.outcome).toBe("rule_guardrail");
  });

  it("يفرض التجاوز الإلزامي حتى عند توصية الذكاء الأخف", () => {
    const ruleAssessment = { score: 90, riskLevel: "Critical" as const, decision: "Manual Review" as const };
    const composed = composeDecision(baseResult({ score: 90, riskLevel: "Critical", decision: "Manual Review", ruleAssessment, policyOverride: "Mandatory website policy." }), recommendation("Approve", 5));
    expect(composed.finalDecision).toBe("Manual Review");
    expect(composed.outcome).toBe("policy_guardrail");
  });

  it("يعيد بناء التنبيه والحالة وفق النتيجة المركبة التي صعّدها الذكاء", () => {
    const applied = applyCompositeDecision(baseResult({ mlSignal: { level: "High" } as AnalysisResult["mlSignal"] }), recommendation("Temporary Hold", 71));
    expect(applied.decision).toBe("Temporary Hold");
    expect(applied.alert).toEqual({ created: true, severity: "High" });
    expect(applied.case).toEqual({ created: true, status: "Open" });
  });
});
