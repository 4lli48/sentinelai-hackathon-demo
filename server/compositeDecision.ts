import type { AiDecisionRecommendation, AnalysisResult, CompositeDecision, Decision, RiskLevel, RuleAssessment } from "../shared/sentinel";

const decisionRank: Record<Decision, number> = {
  Approve: 0,
  "Additional Verification": 1,
  "Temporary Hold": 2,
  "Manual Review": 3,
};

const scoreFloor: Record<Decision, number> = {
  Approve: 0,
  "Additional Verification": 31,
  "Temporary Hold": 61,
  "Manual Review": 81,
};

function riskLevelFor(score: number): RiskLevel {
  if (score >= 81) return "Critical";
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

function currentRuleAssessment(result: Omit<AnalysisResult, "report">): RuleAssessment {
  return result.ruleAssessment ?? { score: result.score, riskLevel: result.riskLevel, decision: result.decision };
}

function hasIndependentEscalationEvidence(result: Omit<AnalysisResult, "report">) {
  return result.factors.length > 0 || result.mlSignal?.level !== "Routine";
}

export function pendingCompositeDecision(ruleAssessment: RuleAssessment): CompositeDecision {
  return {
    ruleAssessment,
    finalScore: ruleAssessment.score,
    finalRiskLevel: ruleAssessment.riskLevel,
    finalDecision: ruleAssessment.decision,
    outcome: "awaiting_ai",
    rationale: "The rule assessment is ready while the AI decision recommendation is being prepared.",
    rationaleAr: "تقييم القواعد جاهز بينما يجري إعداد توصية الذكاء الاصطناعي للقرار.",
  };
}

/**
 * AI can raise the response level when supported by its recommendation. Rules
 * supply the non-bypassable floor, and an explicit policy override always wins.
 */
export function composeDecision(result: Omit<AnalysisResult, "report">, recommendation?: AiDecisionRecommendation): CompositeDecision {
  const ruleAssessment = currentRuleAssessment(result);
  if (!recommendation || recommendation.availability === "unavailable") {
    return {
      ruleAssessment,
      finalScore: ruleAssessment.score,
      finalRiskLevel: ruleAssessment.riskLevel,
      finalDecision: ruleAssessment.decision,
      outcome: "ai_unavailable",
      rationale: "AI recommendation was unavailable, so the rule assessment remains the final operational outcome.",
      rationaleAr: "تعذرت توصية الذكاء الاصطناعي، لذلك يبقى تقييم القواعد هو النتيجة التشغيلية النهائية.",
    };
  }

  if (result.policyOverride) {
    return {
      ruleAssessment,
      finalScore: Math.max(ruleAssessment.score, scoreFloor[ruleAssessment.decision]),
      finalRiskLevel: riskLevelFor(Math.max(ruleAssessment.score, scoreFloor[ruleAssessment.decision])),
      finalDecision: ruleAssessment.decision,
      outcome: "policy_guardrail",
      rationale: "A mandatory policy override is active, so the composite outcome cannot be lowered or bypassed.",
      rationaleAr: "يوجد تجاوز سياسة إلزامي نشط، لذلك لا يمكن خفض النتيجة المركبة أو تجاوزها.",
    };
  }

  const isAiEscalation = decisionRank[recommendation.decision] > decisionRank[ruleAssessment.decision];
  if (isAiEscalation && !hasIndependentEscalationEvidence(result)) {
    return {
      ruleAssessment,
      finalScore: ruleAssessment.score,
      finalRiskLevel: ruleAssessment.riskLevel,
      finalDecision: ruleAssessment.decision,
      outcome: "rule_guardrail",
      rationale: "The AI escalation was not applied because the frozen case has no material rule factors and a routine behaviour signal.",
      rationaleAr: "لم يُطبق تصعيد الذكاء الاصطناعي لأن اللقطة المثبتة لا تحتوي عوامل قواعد مادية وإشارة السلوك فيها اعتيادية.",
    };
  }
  const finalDecision = isAiEscalation ? recommendation.decision : ruleAssessment.decision;
  const finalScore = Math.min(100, Math.max(ruleAssessment.score, recommendation.score, scoreFloor[finalDecision]));
  const outcome: CompositeDecision["outcome"] = isAiEscalation
    ? "ai_escalated"
    : recommendation.decision === ruleAssessment.decision
      ? "aligned"
      : "rule_guardrail";
  const rationale = outcome === "ai_escalated"
    ? "The AI recommendation raised the response level above the rule assessment, so the composite outcome was escalated."
    : outcome === "aligned"
      ? "The AI recommendation and rule assessment agree on the response level."
      : "The AI recommendation was lower than the rule assessment, so the rule-based safety floor remains in force.";
  const rationaleAr = outcome === "ai_escalated"
    ? "رفعت توصية الذكاء الاصطناعي مستوى الاستجابة فوق تقييم القواعد، لذلك صُعّدت النتيجة المركبة."
    : outcome === "aligned"
      ? "تتفق توصية الذكاء الاصطناعي وتقييم القواعد على مستوى الاستجابة."
      : "كانت توصية الذكاء الاصطناعي أقل من تقييم القواعد، لذلك يبقى حد الأمان القائم على القواعد نافذًا.";
  return { ruleAssessment, finalScore, finalRiskLevel: riskLevelFor(finalScore), finalDecision, outcome, rationale, rationaleAr };
}

export function applyCompositeDecision(result: Omit<AnalysisResult, "report">, recommendation?: AiDecisionRecommendation): Omit<AnalysisResult, "report"> {
  const compositeDecision = composeDecision(result, recommendation);
  const decision = compositeDecision.finalDecision;
  const score = compositeDecision.finalScore;
  const riskLevel = compositeDecision.finalRiskLevel;
  const alertCreated = decision === "Temporary Hold" || decision === "Manual Review" || score >= 61;
  const severity: "Medium" | "High" | "Critical" | undefined = score >= 81 ? "Critical" : score >= 61 ? "High" : score >= 31 ? "Medium" : undefined;
  const audit = [...result.audit, {
    index: result.audit.length + 1,
    code: "COMPOSITE_DECISION",
    label: "Composite decision policy",
    labelAr: "سياسة القرار المركب",
    detail: compositeDecision.rationale,
    detailAr: compositeDecision.rationaleAr,
  }];
  return {
    ...result,
    score,
    riskLevel,
    decision,
    aiRecommendation: recommendation,
    compositeDecision,
    audit,
    alert: { created: alertCreated, severity },
    case: { created: decision !== "Approve", status: decision === "Approve" ? "Not required" : "Open" },
  };
}
