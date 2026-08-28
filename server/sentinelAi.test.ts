import { describe, expect, it } from "vitest";
import { __testables } from "./sentinelAi";
import { runDeterministicAnalysis } from "./sentinelEngine";
import { demoScenarios } from "../shared/sentinel";

const { looksLeaked, normalizeReadableLabels, normalizeRegulatoryClaims, cleanTruncatedNarrative, removeLastSentenceWhenShort, isCompleteNarrative, completeNarrative, buildBrief, parseAiDecisionPayload } = __testables;

describe("investigation report guardrails", () => {
  it("flags narratives that echo internal field names", () => {
    expect(looksLeaked("riskLevel: High with snapshotId: ABC123")).toBe(true);
    expect(looksLeaked("العوامل: [] والتجاوز: null")).toBe(true);
    expect(looksLeaked("the rule was Never imply the ML score changed the decision")).toBe(true);
  });

  it("normalizes human-readable report labels without treating them as technical leakage", () => {
    const normalized = normalizeReadableLabels("Final decision: Temporary Hold. Risk score: 65 out of 100. Advisory signal: elevated.");
    expect(normalized).toContain("the final decision is Temporary Hold");
    expect(normalized).toContain("a policy risk score of 65 out of 100");
    expect(looksLeaked(normalized)).toBe(false);
  });

  it("downgrades unsupported regulatory commands to contextual guidance", () => {
    const normalized = normalizeRegulatoryClaims("SAMA guidance necessitates enhanced due diligence before release.", "en");
    expect(normalized.analysis).toContain("curated regulatory context supports a proportionate review");
    expect(normalized.edited).toBe(true);
    expect(normalized.analysis).not.toMatch(/necessitates|requires|mandates/i);
    expect(normalizeRegulatoryClaims("Under SDAIA governance, the advisory.", "en").analysis).toContain("does not set this outcome");
  });

  it("accepts clean banking prose", () => {
    const clean = "The rule engine placed a temporary hold on this transfer after recording a material amount deviation, a new beneficiary relationship and a behavioural shift in destination corridor. The advisory anomaly signal of 62 out of 100 supported early attention only and did not shape the outcome, which remains with the deterministic policy.";
    expect(looksLeaked(clean)).toBe(false);
  });

  it("accepts clean Arabic banking prose", () => {
    const clean = "أوقف محرك القواعد هذا التحويل مؤقتًا بعد رصد انحراف مادي في المبلغ وعلاقة مستفيد جديدة وتغيّر في ممر الوجهة. جاءت إشارة الشذوذ الاستشارية عند 62 من 100 لدعم الانتباه المبكر فقط دون أن تحدد النتيجة التي بقيت بيد السياسة الحتمية.";
    expect(looksLeaked(clean)).toBe(false);
  });

  it("يقبل توصية قرار منظمة ويمنع القيم أو النصوص غير الصالحة", () => {
    const valid = JSON.stringify({
      decision: "Additional Verification",
      riskLevel: "Medium",
      score: 48,
      confidence: 82,
      rationale: "The new beneficiary relationship and transaction context justify additional verification before release.",
      reviewItems: ["Verify the beneficiary relationship.", "Confirm the transfer purpose."],
      analysis: "The transaction includes a new beneficiary relationship and a cross-border context that justify a proportionate additional-verification step before release. The AI assessment recommends obtaining evidence of the relationship and stated purpose, while the policy controls and any mandatory override remain in force throughout the review.",
    });
    expect(parseAiDecisionPayload(valid)?.decision).toBe("Additional Verification");
    const directGeminiShape = JSON.stringify({
      recommendation: "additional_verification",
      risk_level: "medium",
      risk_score: 48,
      confidence_score: 0.82,
      case_note: "The new beneficiary relationship and cross-border context justify additional verification before release. The reviewer should confirm the beneficiary relationship and purpose before proceeding.",
      review_items: ["Verify the beneficiary relationship.", "Confirm the transfer purpose."],
    });
    expect(parseAiDecisionPayload(directGeminiShape)).toMatchObject({ decision: "Additional Verification", riskLevel: "Medium", score: 48, confidence: 82 });
    expect(parseAiDecisionPayload(JSON.stringify({ decision: "Release immediately", riskLevel: "Low", score: 5, confidence: 90, rationale: "A sufficiently long but invalid recommendation text is present.", reviewItems: ["Do something"], analysis: "This intentionally invalid payload contains enough text for the length check but is rejected because its decision is not part of the approved contract for this system." }))).toBeNull();
    expect(parseAiDecisionPayload("not json")).toBeNull();
  });

  it("builds a brief free of JSON syntax for every scenario in both locales", () => {
    for (const scenario of demoScenarios) {
      const result = runDeterministicAnalysis({ ...scenario.input, submittedAt: "2026-08-13T12:00:00.000Z" });
      for (const locale of ["en", "ar"] as const) {
        const brief = buildBrief(result, locale);
        expect(brief).not.toMatch(/[{}]/);
        expect(brief).not.toMatch(/"\w+":/);
        expect(brief.length).toBeGreaterThan(60);
      }
    }
  });

  it("includes every deterministic factor in the brief", () => {
    const laundering = demoScenarios.find(scenario => scenario.id === "laundering");
    const result = runDeterministicAnalysis({ ...laundering!.input, submittedAt: "2026-08-13T12:00:00.000Z" });
    const brief = buildBrief(result, "en");
    for (const factor of result.factors) {
      expect(brief).toContain(factor.title);
    }
  });

  it("accepts a complete advisory paragraph and rejects an abruptly cut one", () => {
    const complete = "The rule engine routed the transfer to manual review after several deterministic indicators combined: a material amount deviation, a new beneficiary, and a destination outside the customer baseline. The anomaly signal supports early attention only. A human reviewer should assess supporting information and the beneficiary relationship before any release decision is considered.";
    expect(isCompleteNarrative(complete)).toBe(true);
    expect(isCompleteNarrative("The transfer is high risk because the destination"))
      .toBe(false);
  });

  it("completes a cut model narrative with a transparent deterministic next step", () => {
    const result = runDeterministicAnalysis({ ...demoScenarios[3].input, submittedAt: "2026-08-13T12:00:00.000Z" });
    const completed = completeNarrative("The destination sits outside the established customer baseline", result, "en");
    expect(completed.completion).toBe("deterministic-completion");
    expect(completed.analysis).toContain("The frozen decision snapshot also records");
    expect(completed.analysis).toContain("Behaviour deviation");
    expect(completed.analysis).toMatch(/[.]$/);
    const completedWithStop = completeNarrative("The destination sits outside the established customer baseline.", result, "en");
    expect(completedWithStop.analysis).not.toContain(".. ");
  });

  it("repairs a split decimal and removes an unfinished anomaly sentence", () => {
    const cleaned = cleanTruncatedNarrative("The amount is 5. 51 times the baseline. An advisory anomaly signal of 62.", "en");
    expect(cleaned).toBe("The amount is 5.51 times the baseline.");
    expect(cleanTruncatedNarrative("The amount is elevated. While the anomaly signal of 62.", "en"))
      .toBe("The amount is elevated.");
  });

  it("removes a sentence that stops at a dangling English preposition", () => {
    const cleaned = cleanTruncatedNarrative("The transfer is elevated. These combined deviations require enhanced due diligence to.", "en");
    expect(cleaned).toBe("The transfer is elevated.");
    expect(cleanTruncatedNarrative("The transfer is held. The amount is 5.51 times baseline. Analysts must perform enhanced due diligence to.", "en"))
      .toBe("The transfer is held. The amount is 5.51 times baseline.");
  });

  it("removes the final sentence from a short, token-limited model excerpt", () => {
    const excerpt = "The transfer is placed on hold. The amount exceeds the baseline. Although the anomaly signal is advisory, analysts must now perform. This fourth sentence is also not retained.";
    expect(removeLastSentenceWhenShort(excerpt, "en")).toBe("The transfer is placed on hold. The amount exceeds the baseline.");
    const arabicExcerpt = "تم إيقاف العملية مؤقتًا بسبب عوامل مخاطر متعددة. يمثل المبلغ انحرافًا كبيرًا مع تصعيد في ت.";
    expect(removeLastSentenceWhenShort(arabicExcerpt, "ar")).toBe("تم إيقاف العملية مؤقتًا بسبب عوامل مخاطر متعددة.");
  });
});
