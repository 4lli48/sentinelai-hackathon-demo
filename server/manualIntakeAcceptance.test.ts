import { describe, expect, it } from "vitest";
import { customers, demoScenarios, type AnalysisResult, type CustomerProfile, type InvestigationReport } from "../shared/sentinel";
import type { RagGrounding } from "../shared/rag";
import { executeManualAnalysis } from "./routers";

const groundedRag: RagGrounding = {
  status: "grounded",
  queryKind: "report",
  retrievedAt: "2026-08-18T00:00:00.000Z",
  citations: [{
    chunkId: "sama-aml-risk-based-monitoring",
    documentId: "sama-aml-ctf-guide",
    authority: "SAMA",
    titleAr: "دليل ساما",
    titleEn: "SAMA guide",
    officialUrl: "https://rulebook.sama.gov.sa/",
    sectionTitle: "Risk-based monitoring",
    excerpt: "Official review context.",
    similarity: 0.81,
  }],
};

function report(locale: "en" | "ar", rag: RagGrounding | undefined): InvestigationReport {
  return { source: "Deterministic fallback", locale, evidence: [], analysis: "Snapshot-bound test report.", references: [], actions: [], rag };
}

function testDependencies(options: { reportRag?: RagGrounding | undefined; profiles?: CustomerProfile[] } = {}) {
  const persisted: AnalysisResult[] = [];
  const groundings: Array<{ transactionId: string; snapshotId: string; grounding: RagGrounding }> = [];
  const profiles = options.profiles ?? customers;
  const reportRag = "reportRag" in options ? options.reportRag : groundedRag;
  return {
    persisted,
    groundings,
    dependencies: {
      loadCustomer: async (customerId: string) => profiles.find(customer => customer.id === customerId) ?? null,
      createReport: async (_base: Omit<AnalysisResult, "report">, locale: "en" | "ar") => report(locale, reportRag),
      persistResult: async (result: AnalysisResult) => {
        persisted.push(result);
        return { transactionId: `internal-${result.id}`, analysisRunId: `run-${result.id}` };
      },
      persistGrounding: async (transactionId: string, snapshotId: string, grounding: RagGrounding) => {
        groundings.push({ transactionId, snapshotId, grounding });
      },
    },
  };
}

describe("قبول الإدخال اليدوي", () => {
  it("يمرر السيناريوهات الأربعة من مدخلات التحويل إلى قرار محفوظ وأثر RAG بمعرف القرار المرجعي", async () => {
    const harness = testDependencies();
    const results = await Promise.all(demoScenarios.map(scenario => executeManualAnalysis({ ...scenario.input, submittedAt: "2026-08-18T12:00:00.000Z", locale: "ar" }, harness.dependencies)));

    expect(results).toHaveLength(4);
    expect(harness.persisted).toHaveLength(4);
    expect(harness.groundings).toHaveLength(4);
    expect(results.map(result => result.decision)).toEqual(["Approve", "Additional Verification", "Manual Review", "Manual Review"]);
    expect(results.find(result => result.snapshot.transaction.beneficiaryName === "Global Trade FZE")?.snapshot.derived.newBeneficiary).toBe(true);
    expect(harness.groundings.map(entry => entry.transactionId)).toEqual(results.map(result => result.id));
    expect(harness.groundings.every(entry => entry.grounding.status === "grounded")).toBe(true);
  });

  it("يحفظ القرار اليدوي حتى عند غياب بيانات RAG المؤهلة", async () => {
    const harness = testDependencies({ reportRag: undefined });
    const input = { ...demoScenarios[3]!.input, submittedAt: "2026-08-18T12:00:00.000Z", locale: "en" as const };
    const result = await executeManualAnalysis(input, harness.dependencies);

    expect(result.snapshot.derived.newBeneficiary).toBe(true);
    expect(harness.persisted).toHaveLength(1);
    expect(harness.groundings).toHaveLength(0);
  });

  it("يرفض العميل غير المعروف قبل إنشاء قرار أو حفظ أي سجل", async () => {
    const harness = testDependencies({ profiles: [] });
    const input = { ...demoScenarios[3]!.input, customerId: "unknown-customer", locale: "en" as const };

    await expect(executeManualAnalysis(input, harness.dependencies)).rejects.toThrow("Sentinel customer profile is not available in Supabase.");
    expect(harness.persisted).toHaveLength(0);
    expect(harness.groundings).toHaveLength(0);
  });
});
