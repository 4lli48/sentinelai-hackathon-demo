import { describe, expect, it } from "vitest";
import { demoScenarios } from "../shared/sentinel";
import { deterministicReport, runDeterministicAnalysis } from "./sentinelEngine";
import { deterministicChatFallback, isInvestigationQuestionInScope, parseInvestigationMessageCategory, requiresSemanticScopeReview, sanitizeInvestigationHistory } from "./sentinelAi";
import { matchesInvestigationLookup } from "./routers";

describe("Investigation chat grounding", () => {
  const base = runDeterministicAnalysis(demoScenarios.find(scenario => scenario.id === "website")!.input);
  const result = { ...base, report: deterministicReport(base, "en") };

  it("keeps only bounded usable conversation turns", () => {
    const history = Array.from({ length: 10 }, (_, index) => ({ role: index % 2 ? "assistant" as const : "user" as const, content: `message ${index}` }));
    const clean = sanitizeInvestigationHistory([...history, { role: "user", content: "   " }]);
    expect(clean).toHaveLength(8);
    expect(clean[0].content).toBe("message 2");
  });

  it("makes the deterministic fallback explicit and grounded in the frozen result", () => {
    const answer = deterministicChatFallback(result, "en");
    expect(answer).toContain(result.snapshot.snapshotId);
    expect(answer).toContain(result.decision);
    expect(answer).toContain("High-risk website signals");
    expect(answer).not.toContain("Gemini AI");
  });

  it("localizes the fallback without changing the decision", () => {
    const answer = deterministicChatFallback(result, "ar");
    expect(answer).toContain(result.snapshot.snapshotId);
    expect(answer).toContain("النتيجة المركبة");
    expect(result.decision).toBe("Manual Review");
  });

  it("accepts a frozen local snapshot only for its operation or snapshot identifier", () => {
    expect(matchesInvestigationLookup(result, result.id)).toBe(true);
    expect(matchesInvestigationLookup(result, "missing-operation", result.snapshot.snapshotId)).toBe(true);
    expect(matchesInvestigationLookup(result, "other-operation", "other-snapshot")).toBe(false);
  });

  it("allows natural social chat while blocking obvious general questions and preserving case follow-ups", () => {
    expect(isInvestigationQuestionInScope("ما عاصمة فرنسا؟")).toBe(false);
    expect(isInvestigationQuestionInScope("اكتب لي قصيدة قصيرة")).toBe(false);
    expect(isInvestigationQuestionInScope("من أنت؟")).toBe(true);
    expect(isInvestigationQuestionInScope("شكرًا")).toBe(true);
    expect(isInvestigationQuestionInScope("hello")).toBe(true);
    expect(isInvestigationQuestionInScope("ما سبب قرار المراجعة اليدوية؟")).toBe(true);
    expect(isInvestigationQuestionInScope("هل هذا المستفيد جديد؟")).toBe(true);
    expect(isInvestigationQuestionInScope("لماذا؟", [{ role: "assistant", content: "سجل المحرك مستفيدًا جديدًا." }])).toBe(true);
  });

  it("only sends ambiguous messages to the semantic scope review", () => {
    expect(requiresSemanticScopeReview("من أنت؟")).toBe(false);
    expect(requiresSemanticScopeReview("ما عاصمة فرنسا؟")).toBe(false);
    expect(requiresSemanticScopeReview("ما سبب قرار المراجعة؟")).toBe(false);
    expect(requiresSemanticScopeReview("هل تستطيع الحديث عن الرياضة؟")).toBe(true);
    expect(parseInvestigationMessageCategory("CASE")).toBe("case");
    expect(parseInvestigationMessageCategory("SOCIAL")).toBe("social");
    expect(parseInvestigationMessageCategory("OUT_OF_SCOPE")).toBe("out_of_scope");
    expect(parseInvestigationMessageCategory("maybe")).toBe("uncertain");
  });
});
