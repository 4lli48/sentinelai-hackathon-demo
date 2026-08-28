import { compositeDecisionFor, ruleAssessmentFor, type AnalysisResult, type InvestigationReport } from "@shared/sentinel";
import { decisionLabel, riskLabel } from "./sentinelUi";
import { regulatoryReferencesFor } from "@shared/regulatoryReferences";

export function reportForLocale(result: AnalysisResult, locale: "en" | "ar"): InvestigationReport {
  if (result.report.source === "Gemini AI" || result.report.locale === locale) return result.report;
  const isAr = locale === "ar";
  const ruleAssessment = ruleAssessmentFor(result);
  const compositeDecision = compositeDecisionFor(result);
  const evidence = result.factors.length
    ? result.factors.map(factor => isAr ? `${factor.titleAr}: ${factor.evidenceAr}` : `${factor.title}: ${factor.evidence}`)
    : [isAr ? "لم تُفعّل أي عوامل مخاطر حتمية مادية." : "No material deterministic risk factors were triggered."];
  const actions = result.decision === "Approve"
    ? [isAr ? "متابعة الرصد الاعتيادي." : "Proceed with routine monitoring."]
    : result.decision === "Additional Verification"
      ? [isAr ? "طلب معلومات داعمة قبل الإجراء." : "Request supporting information before release."]
      : [isAr ? "إحالة الحالة إلى مراجع بشري." : "Route the case to a human reviewer."];
  return {
    source: "Deterministic fallback",
    completion: "model",
    locale,
    evidence,
    analysis: isAr
      ? `سجّل تقييم القواعد مستوى «${decisionLabel(ruleAssessment.decision, "ar")}» بدرجة ${ruleAssessment.score}/100، ثم دمجت سياسة القرار توصية الذكاء الاصطناعي ضمن حد القواعد والحواجز الإلزامية. النتيجة المركبة هي «${decisionLabel(compositeDecision.finalDecision, "ar")}» بمستوى مخاطر ${riskLabel(compositeDecision.finalRiskLevel, "ar")} ودرجة ${compositeDecision.finalScore}/100. ${result.factors.length ? `وتبقى ${result.factors.length} عوامل مسجلة جزءًا من لقطة القضية الثابتة.` : "لم تُفعّل عوامل حتمية مادية."}${result.policyOverrideAr ? ` كما طُبق تجاوز السياسة: ${result.policyOverrideAr}` : ""}`
      : `The rule assessment recorded ${ruleAssessment.decision} at ${ruleAssessment.score}/100, then composite policy combined the AI recommendation within the rule safety floor and mandatory guardrails. The composite outcome is ${compositeDecision.finalDecision} at ${riskLabel(compositeDecision.finalRiskLevel, "en")} risk and ${compositeDecision.finalScore}/100. ${result.factors.length ? `${result.factors.length} recorded factors remain part of the frozen case evidence.` : "No material deterministic factors were triggered."}${result.policyOverride ? ` The policy override applied was: ${result.policyOverride}` : ""}`,
    references: regulatoryReferencesFor(result, locale),
    actions,
    rag: result.report.rag,
    aiRecommendation: result.report.aiRecommendation,
  };
}
