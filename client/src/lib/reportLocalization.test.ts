import { describe, expect, it } from "vitest";
import type { AnalysisResult } from "@shared/sentinel";
import { reportForLocale } from "./reportLocalization";

describe("report localization", () => {
  it("keeps a saved live report rather than replacing it when the interface locale differs", () => {
    const report = {
      source: "Gemini AI" as const,
      completion: "model" as const,
      locale: "en" as const,
      evidence: [],
      analysis: "Saved live analysis.",
      references: [],
      actions: [],
    };
    const result = { report } as AnalysisResult;
    expect(reportForLocale(result, "ar")).toBe(report);
  });

  it("يحافظ على بيانات RAG عند إنشاء عرض تقرير باللغة الأخرى", () => {
    const rag = { status: "grounded", queryKind: "report", citations: [], retrievedAt: "2026-08-18T00:00:00.000Z" } as const;
    const result = {
      decision: "Additional Verification",
      riskLevel: "Medium",
      score: 35,
      factors: [],
      mlSignal: { score: 50, explanation: "English", explanationAr: "عربي" },
      report: { source: "Deterministic fallback", locale: "en", evidence: [], analysis: "", references: [], actions: [], rag },
    } as unknown as AnalysisResult;

    expect(reportForLocale(result, "ar").rag).toBe(rag);
  });
});
