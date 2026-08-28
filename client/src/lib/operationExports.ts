import { compositeDecisionFor, ruleAssessmentFor, type AnalysisResult, type Locale } from "@shared/sentinel";
import { regulatoryReferencesFor } from "@shared/regulatoryReferences";

type CellValue = string | number;
export type WorkbookSheet = { name: string; rows: CellValue[][]; widths: number[] };

const printableDate = (iso: string, locale: Locale) => new Date(iso).toLocaleString(locale === "ar" ? "ar-SA" : "en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

function filenamePart(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "decision";
}

/** jsPDF's bundled Helvetica does not contain Arabic glyphs. Keep this compact PDF legible and point to the bilingual XLSX/investigation record when a field has no Latin representation. */
export function latinPdfText(value: string, fallback = "Recorded in frozen decision snapshot") {
  const candidates = value.split("|").map(candidate => candidate.trim());
  const preferred = candidates.sort((left, right) => (right.match(/[a-z0-9]/gi)?.length ?? 0) - (left.match(/[a-z0-9]/gi)?.length ?? 0))[0] ?? "";
  const clean = preferred.replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();
  return /[a-z0-9]/i.test(clean) ? clean : fallback;
}

function labels(locale: Locale) {
  return locale === "ar"
    ? { overview: "ملخص القرار", factors: "عوامل القرار", audit: "سجل التدقيق", customer: "سجل العميل", ml: "إشارة السلوك", references: "المراجع الرسمية", decision: "النتيجة المركبة", risk: "مستوى المخاطر", score: "الدرجة", snapshot: "معرف اللقطة", generated: "وقت التصدير", source: "نموذج القرار", rule: "قواعد + توصية ذكاء", ruleAssessment: "تقييم القواعد", aiRecommendation: "توصية الذكاء", combination: "حالة الدمج" }
    : { overview: "Decision overview", factors: "Decision factors", audit: "Audit trail", customer: "Customer history", ml: "Behaviour assessment", references: "Official references", decision: "Composite outcome", risk: "Risk level", score: "Score", snapshot: "Snapshot ID", generated: "Exported at", source: "Decision model", rule: "Rules + AI recommendation", ruleAssessment: "Rule assessment", aiRecommendation: "AI recommendation", combination: "Combination status" };
}

/** Maps only the immutable operation snapshot into six reviewable worksheets. */
export function buildOperationWorkbook(result: AnalysisResult, locale: Locale): WorkbookSheet[] {
  const l = labels(locale);
  const isAr = locale === "ar";
  const report = result.report;
  const ruleAssessment = ruleAssessmentFor(result);
  const compositeDecision = compositeDecisionFor(result);
  const officialReferences = regulatoryReferencesFor(result, locale);
  return [
    {
      name: l.overview,
      widths: [26, 64],
      rows: [
        ["SentinelAI", l.overview],
        [l.decision, result.decision],
        [l.risk, result.riskLevel],
        [l.score, `${result.score}/100`],
        [l.ruleAssessment, `${ruleAssessment.decision} · ${ruleAssessment.riskLevel} · ${ruleAssessment.score}/100`],
        [l.aiRecommendation, result.aiRecommendation?.availability === "available" ? `${result.aiRecommendation.decision} · ${result.aiRecommendation.riskLevel} · ${result.aiRecommendation.score}/100 · ${result.aiRecommendation.confidence}% confidence` : (isAr ? "غير متاحة؛ يبقى حد القواعد نافذًا" : "Unavailable; the rule safety floor remains in force")],
        [l.combination, compositeDecision.outcome],
        [l.snapshot, result.snapshot.snapshotId],
        [l.source, l.rule],
        ["Customer", result.snapshot.customer.name],
        ["Amount (SAR)", result.snapshot.transaction.amount],
        ["Destination", result.snapshot.transaction.destinationCountry],
        ["Beneficiary", result.snapshot.transaction.beneficiaryName],
        [l.generated, printableDate(new Date().toISOString(), locale)],
      ],
    },
    {
      name: l.factors,
      widths: [26, 16, 16, 72],
      rows: [["Factor", "Category", "Points", "Evidence"], ...result.factors.map(factor => [isAr ? factor.titleAr : factor.title, factor.category, factor.points, isAr ? factor.evidenceAr : factor.evidence])],
    },
    {
      name: l.audit,
      widths: [10, 28, 80],
      rows: [["#", "Stage", "Recorded detail"], ...result.audit.map(stage => [stage.index, isAr ? stage.labelAr : stage.label, isAr ? stage.detailAr : stage.detail])],
    },
    {
      name: l.customer,
      widths: [30, 62],
      rows: [
        ["Customer", result.snapshot.customer.name],
        ["Historical transfers", result.snapshot.customer.transactionCount],
        ["Average amount (SAR)", result.snapshot.customer.averageAmount],
        ["Usual countries", result.snapshot.customer.usualCountries.join(", ") || "—"],
        ["Trusted beneficiaries", result.snapshot.customer.trustedBeneficiaries.join(", ") || "—"],
        ["Amount / average", result.snapshot.derived.amountToAverageRatio],
        ["New beneficiary", result.snapshot.derived.newBeneficiary ? "Yes" : "No"],
        ["New destination", result.snapshot.derived.newCountry ? "Yes" : "No"],
      ],
    },
    {
      name: l.ml,
      widths: [32, 72],
      rows: [
        ["Method", result.mlSignal.method],
        ["Role", isAr ? "دليل لتوصية الذكاء ضمن حواجز القواعد" : "Evidence for the AI recommendation within rule guardrails"],
        ["Score", `${result.mlSignal.score}/100`],
        ["Level", result.mlSignal.level],
        ["Explanation", isAr ? result.mlSignal.explanationAr : result.mlSignal.explanation],
        ["Feature signals", result.mlSignal.featureSignals.join(", ")],
      ],
    },
    {
      name: l.references,
      widths: [16, 40, 84],
      rows: [["Authority", "Reference", "Context / source"], ...officialReferences.map(reference => [isAr ? reference.authorityAr : reference.authority, isAr ? reference.titleAr : reference.title, `${isAr ? reference.contextAr : reference.context}${reference.url ? ` — ${reference.url}` : ""}`])],
    },
  ];
}

export async function exportOperationExcel(result: AnalysisResult, locale: Locale) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  buildOperationWorkbook(result, locale).forEach((sheetDefinition, index) => {
    const sheet = XLSX.utils.aoa_to_sheet(sheetDefinition.rows);
    sheet["!cols"] = sheetDefinition.widths.map(width => ({ wch: width }));
    sheet["!view"] = [{ rightToLeft: locale === "ar", showGridLines: false }];
    sheet["!freeze"] = { xSplit: 0, ySplit: index === 0 ? 1 : 1 };
    XLSX.utils.book_append_sheet(workbook, sheet, sheetDefinition.name.slice(0, 31));
  });
  const filename = `sentinelai-${filenamePart(result.id)}.xlsx`;
  XLSX.writeFile(workbook, filename, { compression: true });
  return filename;
}

function addPdfLines(doc: import("jspdf").jsPDF, title: string, lines: string[], startY: number) {
  let y = startY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, 16, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  lines.forEach(line => {
    const wrapped = doc.splitTextToSize(line, 176) as string[];
    if (y + wrapped.length * 5 > 280) {
      doc.addPage();
      y = 18;
    }
    doc.text(wrapped, 16, y);
    y += wrapped.length * 5 + 2;
  });
  return y + 4;
}

/** PDF uses Latin operational labels so it remains readable without requiring a bundled Arabic font; the XLSX keeps the complete bilingual record. */
export async function exportOperationPdf(result: AnalysisResult) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFillColor(7, 77, 62);
  doc.rect(0, 0, 210, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SentinelAI — Decision Record", 16, 15);
  doc.setTextColor(25, 45, 40);
  let y = 35;
  const ruleAssessment = ruleAssessmentFor(result);
  const compositeDecision = compositeDecisionFor(result);
  y = addPdfLines(doc, "Decision summary", [
    `Composite outcome: ${compositeDecision.finalDecision} | Risk: ${compositeDecision.finalRiskLevel} | Score: ${compositeDecision.finalScore}/100`,
    `Rule assessment: ${ruleAssessment.decision} | ${ruleAssessment.riskLevel} | ${ruleAssessment.score}/100`,
    `AI recommendation: ${result.aiRecommendation?.availability === "available" ? `${result.aiRecommendation.decision} | ${result.aiRecommendation.riskLevel} | ${result.aiRecommendation.score}/100 | confidence ${result.aiRecommendation.confidence}%` : "Unavailable; rule safety floor retained"}`,
    `Combination status: ${compositeDecision.outcome}`,
    `Snapshot: ${result.snapshot.snapshotId} | Frozen: ${result.snapshot.frozenAt}`,
    `Customer: ${latinPdfText(result.snapshot.customer.name)} | Amount: SAR ${result.snapshot.transaction.amount.toLocaleString("en-US")}`,
    `Destination: ${latinPdfText(result.snapshot.transaction.destinationCountry)} | Beneficiary: ${latinPdfText(result.snapshot.transaction.beneficiaryName)}`,
    "Decision model: rules plus AI recommendation. Rules provide the safety floor and mandatory policy guardrails cannot be bypassed. The bilingual XLSX contains the full Arabic and English record.",
  ], y);
  y = addPdfLines(doc, "Recorded deterministic factors", result.factors.length ? result.factors.map(factor => `${factor.title} (+${factor.points}): ${factor.evidence}`) : ["No material deterministic factors were triggered."], y);
  y = addPdfLines(doc, "Behaviour assessment", [`${result.mlSignal.method}: ${result.mlSignal.score}/100 (${result.mlSignal.level}). This evidence informs the AI recommendation within rule guardrails. ${result.mlSignal.explanation}`], y);
  y = addPdfLines(doc, "Reviewer actions", result.report.actions.length ? result.report.actions.map(action => latinPdfText(action, "Reviewer action is recorded in the bilingual investigation file.")) : ["Review the frozen evidence file."], y);
  addPdfLines(doc, "Official reference context", regulatoryReferencesFor(result, "en").map(reference => `${reference.authority}: ${reference.title}${reference.url ? ` — ${reference.url}` : ""}`), y);
  const filename = `sentinelai-${filenamePart(result.id)}.pdf`;
  doc.save(filename);
  return filename;
}
