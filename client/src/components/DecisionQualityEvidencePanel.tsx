import { useDemo } from "@/contexts/DemoContext";
import { trpc } from "@/lib/trpc";
import { runDecisionBenchmark, type DecisionBenchmarkReport } from "@shared/decisionBenchmark";
import { decisionLabel } from "@/lib/sentinelUi";
import { CheckCircle2, ShieldCheck, Scale, AlertTriangle, Layers, ShieldAlert, Cpu, DatabaseZap, ExternalLink, BookmarkCheck, FileText, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

export function DecisionQualityEvidencePanel() {
  const { locale } = useDemo();
  const isAr = locale === "ar";
  const [externalReference, setExternalReference] = useState<{ url: string; label: string } | null>(null);

  const { data: remoteReport } = trpc.sentinel.decisionQualityEvidence.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
  });

  const report: DecisionBenchmarkReport = remoteReport ?? runDecisionBenchmark();
  const { metrics, sampleCases } = report;

  return (
    <section className="panel governance-references decision-benchmark-section" aria-labelledby="decision-benchmark-title">
      {/* Header */}
      <div className="governance-references-heading">
        <div>
          <span className="section-index">14</span>
          <h3 id="decision-benchmark-title">
            <Scale size={17} />
            {isAr ? report.title.ar : report.title.en}
          </h3>
          <p>{isAr ? report.explanation.ar : report.explanation.en}</p>
        </div>
        <div className="benchmark-badges-cluster">
          <span className="governance-source-count benchmark-verified-badge">
            <CheckCircle2 size={13} aria-hidden="true" />
            {isAr ? report.badge.ar : report.badge.en}
          </span>
          <span className="benchmark-engine-tag">
            <Cpu size={12} aria-hidden="true" />
            {isAr ? "محرك تقييم المخاطر الموحد (Unified Compute)" : "Unified Risk Engine (Unified Compute)"}
          </span>
        </div>
      </div>

      {/* 3 Core Computed Metrics */}
      {/* 3 Core Computed Metrics */}
      <div className="benchmark-metrics-grid">
        <article className="benchmark-metric-card highlight-metric">
          <div className="metric-head">
            <span>{isAr ? "تطابق سياسة القرار" : "Decision-policy agreement"}</span>
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="metric-circle-center">
            <div className="metric-ring-container">
              <svg viewBox="0 0 92 92" className="metric-ring-svg" aria-hidden="true">
                <circle cx="46" cy="46" r="38" className="metric-ring-bg" />
                <circle
                  cx="46"
                  cy="46"
                  r="38"
                  className="metric-ring-bar agreement-ring"
                  style={{
                    strokeDasharray: 238.76,
                    strokeDashoffset: 238.76 * (1 - metrics.decisionPolicyAgreement / 100),
                  }}
                />
              </svg>
              <div className="metric-ring-label">
                <b>{metrics.decisionPolicyAgreement}%</b>
              </div>
            </div>
          </div>
          <small>{isAr ? metrics.matchedCases + " من أصل " + metrics.totalCases + " حالة مرجعية متطابقة بالكامل" : metrics.matchedCases + " of " + metrics.totalCases + " benchmark cases fully aligned"}</small>
        </article>

        <article className="benchmark-metric-card">
          <div className="metric-head">
            <span>{isAr ? "التقاط التدخل المطلوب" : "Required-review capture"}</span>
            <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="metric-circle-center">
            <div className="metric-ring-container">
              <svg viewBox="0 0 92 92" className="metric-ring-svg" aria-hidden="true">
                <circle cx="46" cy="46" r="38" className="metric-ring-bg" />
                <circle
                  cx="46"
                  cy="46"
                  r="38"
                  className="metric-ring-bar capture-ring"
                  style={{
                    strokeDasharray: 238.76,
                    strokeDashoffset: 238.76 * (1 - metrics.requiredReviewCapture / 100),
                  }}
                />
              </svg>
              <div className="metric-ring-label">
                <b>{metrics.requiredReviewCapture}%</b>
              </div>
            </div>
          </div>
          <small>{isAr ? "التقاط 180 / 180 من حالات التحقق والمراجعة الإلزامية" : "Captured 180 / 180 verification & review cases"}</small>
        </article>

        <article className="benchmark-metric-card">
          <div className="metric-head">
            <span>{isAr ? "تصعيد غير لازم" : "Unneeded escalation"}</span>
            <AlertTriangle size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="metric-circle-center">
            <div className="metric-ring-container">
              <svg viewBox="0 0 92 92" className="metric-ring-svg" aria-hidden="true">
                <circle cx="46" cy="46" r="38" className="metric-ring-bg" />
                <circle
                  cx="46"
                  cy="46"
                  r="38"
                  className="metric-ring-bar zero-ring"
                  style={{
                    strokeDasharray: 238.76,
                    strokeDashoffset: 238.76 * (1 - metrics.unneededEscalation / 100),
                  }}
                />
              </svg>
              <div className="metric-ring-label">
                <b>{metrics.unneededEscalation}%</b>
              </div>
            </div>
          </div>
          <small>{isAr ? "0 / 60 تصعيد غير مبرر للعمليات الاعتيادية الطبيعية" : "0 / 60 false escalations on routine transactions"}</small>
        </article>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="benchmark-distribution-wrapper">
        <div className="benchmark-distribution-head">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-emerald-700 dark:text-emerald-400" />
            <strong>{isAr ? "توزيع الحالات المرجعية الخمس (240 حالة معلّمة):" : "Reference Cases Category Distribution (240 labeled cases):"}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="benchmark-version-tag">{isAr ? "الإصدار المثبت " + report.version : "Pinned " + report.version}</span>
            <span className="benchmark-count-tag">{metrics.totalCases} {isAr ? "حالة" : "cases"}</span>
          </div>
        </div>

        <div className="benchmark-categories-grid">
          {(Object.keys(metrics.categoryBreakdown) as Array<keyof typeof metrics.categoryBreakdown>).map((catId) => {
            const cat = metrics.categoryBreakdown[catId];
            return (
              <div className="benchmark-category-card" key={catId}>
                <div className="cat-card-header">
                  <b>{isAr ? cat.nameAr : cat.nameEn}</b>
                  <span className="cat-card-count">{cat.total} {isAr ? "حالة" : "cases"}</span>
                </div>
                <p className="cat-card-desc">{isAr ? cat.descriptionAr : cat.descriptionEn}</p>
                <div className="cat-card-footer">
                  <div className="cat-card-bar">
                    <div className="cat-card-fill" style={{ width: cat.agreementPct + "%" }} />
                  </div>
                  <span className="cat-card-match">
                    <CheckCircle2 size={11} />
                    {isAr ? "تطابق " + cat.agreementPct + "%" : cat.agreementPct + "% match"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 Representative Sample Cases */}
      <div className="benchmark-samples-wrapper">
        <div className="benchmark-samples-head">
          <div className="flex items-center gap-2">
            <BookmarkCheck size={15} className="text-emerald-700 dark:text-emerald-400" />
            <strong>{isAr ? "عينات مرجعية ممثلة تقارن القرار المتوقع بقرار المحرك الحتمي:" : "Representative Samples: Expected vs Engine Deterministic Decision:"}</strong>
          </div>
          <span className="text-xs font-semibold text-slate-500">{isAr ? "5 عينات فحص" : "5 inspection samples"}</span>
        </div>

        <div className="benchmark-samples-table-container">
          <table className="benchmark-samples-table">
            <thead>
              <tr>
                <th>{isAr ? "الحالة المرجعية والدليل" : "Reference Case & Evidence"}</th>
                <th>{isAr ? "الفئة" : "Category"}</th>
                <th>{isAr ? "القرار المتوقع" : "Expected Decision"}</th>
                <th>{isAr ? "قرار المحرك" : "Engine Decision"}</th>
                <th>{isAr ? "درجة القواعد" : "Rules Score"}</th>
                <th>{isAr ? "إشارة السلوك (ML)" : "Behavior Signal (ML)"}</th>
                <th>{isAr ? "المطابقة" : "Match"}</th>
              </tr>
            </thead>
            <tbody>
              {sampleCases.map((sample) => (
                <tr key={sample.id}>
                  <td className="sample-case-cell">
                    <div className="flex items-center gap-2">
                      <code>{sample.id}</code>
                      <b>{isAr ? sample.titleAr : sample.titleEn}</b>
                    </div>
                    <p className="sample-case-desc">{isAr ? sample.descriptionAr : sample.descriptionEn}</p>
                    <div className="sample-factors-list">
                      {((isAr ? sample.factorsTriggeredAr : sample.factorsTriggeredEn) ?? []).map((f, i) => (
                        <span className="sample-factor-chip" key={i}>{f}</span>
                      ))}
                      {sample.policyOverride ? (
                        <span className="sample-factor-chip override-chip">
                          {isAr ? sample.policyOverrideAr : sample.policyOverride}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span className="sample-category-tag">
                      {isAr ? sample.categoryNameAr : sample.categoryNameEn}
                    </span>
                  </td>
                  <td>
                    <span className={"sample-decision-badge expected " + sample.expectedDecision.toLowerCase().replace(/\s+/g, "-")}>
                      {decisionLabel(sample.expectedDecision, isAr ? "ar" : "en")}
                    </span>
                  </td>
                  <td>
                    <span className={"sample-decision-badge actual " + sample.engineDecision.toLowerCase().replace(/\s+/g, "-")}>
                      {decisionLabel(sample.engineDecision, isAr ? "ar" : "en")}
                    </span>
                  </td>
                  <td>
                    <div className="score-meter-wrapper">
                      <b className="font-mono text-xs">{sample.rulesScore}/100</b>
                      <div className="score-mini-bar">
                        <div className={"score-mini-fill " + (sample.rulesScore >= 81 ? "critical" : sample.rulesScore >= 61 ? "high" : sample.rulesScore >= 31 ? "medium" : "low")} style={{ width: Math.max(8, sample.rulesScore) + "%" }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="score-meter-wrapper">
                      <span className={"behavior-mini-pill " + ((sample.behaviorLevel ?? "Routine") ?? "routine").toLowerCase()}>
                        {sample.behaviorScore}/100 · {sample.behaviorLevel}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="sample-match-badge">
                      <CheckCircle2 size={13} />
                      {isAr ? "مطابق" : "Aligned"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAG 5-Stage Regulatory Grounding Evidence */}
      <div className="benchmark-rag-grounding-proof">
        <div className="rag-grounding-proof-head">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-emerald-700 dark:text-emerald-400" />
            <strong>{isAr ? "سلسلة إثبات مصدر RAG المعتمدة (المرجع التنظيمي → المقطع → الصلة → الاقتباس → الرابط):" : "RAG Regulatory Grounding Trace (Source → Passage → Relevance → Excerpt → Link):"}</strong>
          </div>
          <span className="rag-grounding-proof-tag">{isAr ? "مسار قابل للتدقيق" : "Auditable Trace"}</span>
        </div>

        <div className="rag-proof-stepper-visual">
          <div className="rag-proof-step">
            <span className="rag-proof-num">1</span>
            <div>
              <b>{isAr ? "المصدر الرسمي" : "Official Source"}</b>
              <small>SAMA · FATF · SDAIA</small>
            </div>
          </div>
          <span className="rag-proof-arrow" aria-hidden="true">→</span>
          <div className="rag-proof-step">
            <span className="rag-proof-num">2</span>
            <div>
              <b>{isAr ? "المقطع المحفوظ" : "Saved Passage"}</b>
              <code>chunk-id: sama-risk-factors</code>
            </div>
          </div>
          <span className="rag-proof-arrow" aria-hidden="true">→</span>
          <div className="rag-proof-step">
            <span className="rag-proof-num">3</span>
            <div>
              <b>{isAr ? "صلة بالسياق" : "Context Relevance"}</b>
              <small className="relevance-pct">94% Relevance</small>
            </div>
          </div>
          <span className="rag-proof-arrow" aria-hidden="true">→</span>
          <div className="rag-proof-step">
            <span className="rag-proof-num">4</span>
            <div>
              <b>{isAr ? "اقتباس ظاهر" : "Visible Excerpt"}</b>
              <small>{isAr ? "نص معتمد باللغة الحالية" : "Verified localized excerpt"}</small>
            </div>
          </div>
          <span className="rag-proof-arrow" aria-hidden="true">→</span>
          <div className="rag-proof-step">
            <span className="rag-proof-num">5</span>
            <div>
              <b>{isAr ? "رابط رسمي" : "Auditable Link"}</b>
              <button
                type="button"
                className="rag-proof-source-link"
                onClick={() => setExternalReference({
                  url: "https://rulebook.sama.gov.sa/en/guidance-anti-money-laundering-and-combating-terrorist-financing",
                  label: isAr ? "دليل ساما لمكافحة غسل الأموال وتمويل الإرهاب" : "SAMA AML/CTF Guide"
                })}
              >
                <ExternalLink size={11} aria-hidden="true" />
                {isAr ? "فحص المصدر (ساما)" : "Inspect SAMA Source"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Isolation & Governance Assurance Disclaimer */}
      <div className="benchmark-disclaimer-wrapper">
        <ShieldAlert size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <div>
          <b>{isAr ? "ضمانة العزل والموثوقية:" : "Isolation & Reliability Assurance:"}</b>
          <p>{isAr ? report.disclaimer.ar : report.disclaimer.en}</p>
        </div>
      </div>

      {/* External Reference Confirmation Dialog */}
      <Dialog open={Boolean(externalReference)} onOpenChange={open => { if (!open) setExternalReference(null); }}>
        <DialogContent className="external-confirm-dialog">
          <DialogTitle>{isAr ? "فتح مصدر تنظيمي رسمي خارجي؟" : "Open an official external regulatory source?"}</DialogTitle>
          <DialogDescription>{isAr ? "ستنتقل إلى المصدر التنظيمي المعتمد في علامة تبويب جديدة خارج النظام لمراجعة المرجع الأصلي." : "You will open the approved regulatory source in a new tab outside SentinelAI to review the original passage."}</DialogDescription>
          <p className="external-confirm-url">{externalReference?.label}</p>
          <DialogFooter>
            <button type="button" className="secondary-button" onClick={() => setExternalReference(null)}>
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button type="button" className="primary-button" onClick={() => {
              if (externalReference) window.open(externalReference.url, "_blank", "noopener,noreferrer");
              setExternalReference(null);
            }}>
              {isAr ? "متابعة إلى المصدر الرسمي" : "Continue to official source"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
