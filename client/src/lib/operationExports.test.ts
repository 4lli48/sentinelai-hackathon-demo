import { describe, expect, it } from "vitest";
import type { AnalysisResult } from "@shared/sentinel";
import { buildOperationWorkbook, latinPdfText } from "./operationExports";

const result = {
  id: "case_001",
  score: 35,
  riskLevel: "Medium",
  decision: "Additional Verification",
  factors: [{ id: "new-beneficiary", title: "New beneficiary", titleAr: "مستفيد جديد", points: 15, category: "Beneficiary", evidence: "Absent from relationship history.", evidenceAr: "غير موجود في تاريخ العلاقة." }],
  snapshot: { snapshotId: "snapshot_001", frozenAt: "2026-08-14T12:00:00.000Z", customer: { id: "khalid", name: "Khalid", nameAr: "خالد", averageAmount: 4100, transactionCount: 18, usualCountries: ["Saudi Arabia"], trustedBeneficiaries: [], usualHours: [9, 18], priorRisk: false }, transaction: { customerId: "khalid", amount: 7000, currency: "SAR", destinationCountry: "Turkey", beneficiaryName: "Mariam", transactionType: "Personal Transfer", submittedAt: "2026-08-14T12:00:00.000Z" }, derived: { amountToAverageRatio: 1.71, newBeneficiary: true, newCountry: true, noHistoricalBaseline: false, outsideUsualHours: false } },
  mlSignal: { score: 52, level: "Elevated", method: "Isolation Forest", advisory: true, explanation: "Advisory only.", explanationAr: "استشارية فقط.", featureSignals: ["new beneficiary relationship"] },
  audit: [{ index: 1, code: "INTAKE", label: "Intake validation", labelAr: "التحقق من الإدخال", detail: "Complete", detailAr: "مكتمل" }],
  alert: { created: false },
  case: { created: true, status: "Open" },
  report: { source: "Gemini AI", locale: "en", evidence: [], analysis: "", references: [{ id: "fatf-rba", authority: "FATF", authorityAr: "FATF", title: "Risk-based guidance", titleAr: "إرشاد قائم على المخاطر", url: "https://example.test", context: "Context", contextAr: "سياق" }], actions: ["Verify beneficiary."] },
} as AnalysisResult;

describe("buildOperationWorkbook", () => {
  it("creates six reviewable sheets from only the immutable decision snapshot", () => {
    const sheets = buildOperationWorkbook(result, "en");
    expect(sheets).toHaveLength(6);
    expect(sheets.map(sheet => sheet.name)).toEqual(["Decision overview", "Decision factors", "Audit trail", "Customer history", "Behaviour assessment", "Official references"]);
    expect(sheets[0]?.rows).toContainEqual(["Rule assessment", "Additional Verification · Medium · 35/100"]);
    expect(sheets[0]?.rows).toContainEqual(["AI recommendation", "Unavailable; the rule safety floor remains in force"]);
    expect(sheets[1]?.rows[1]).toEqual(["New beneficiary", "Beneficiary", 15, "Absent from relationship history."]);
    expect(sheets[3]?.rows).toContainEqual(["Historical transfers", 18]);
    expect(sheets[5]?.rows).toContainEqual(["FATF", "FATF Recommendations", expect.stringContaining("fatf-gafi.org/en/topics/fatf-recommendations")]);
    expect(JSON.stringify(sheets[5]?.rows)).not.toContain("example.test");
  });

  it("يحافظ على قابلية قراءة PDF اللاتيني عند وجود قيمة عربية ضمن الحقول الثنائية", () => {
    expect(latinPdfText("Noura Al-Dosari | نورة الدوسري")).toBe("Noura Al-Dosari");
    expect(latinPdfText("شركة النخبة الطبية", "See bilingual XLSX")).toBe("See bilingual XLSX");
    expect(latinPdfText("إجراء بالعربية.", "Review the bilingual case file")).toBe("Review the bilingual case file");
  });
});
