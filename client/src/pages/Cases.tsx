import SentinelLayout from "@/components/SentinelLayout";
import { useDemo } from "@/contexts/DemoContext";
import { AuditStartPanel } from "@/components/AuditStartPanel";
import { countryLabel, decisionLabel, riskLabel, riskTone, sar } from "@/lib/sentinelUi";
import { Archive, ChevronRight, FileWarning, Filter, ShieldAlert } from "lucide-react";
import { mergeDecisionResults } from "@/lib/persistentResults";
import { CaseDecisionFilter, CaseRiskFilter, filterCaseRecords } from "@/lib/caseFilters";
import { caseFilterDelay } from "@/lib/interactionMotion";
import { reviewPriority } from "@/lib/reviewWorkflow";
import { trpc } from "@/lib/trpc";
import { Link, useSearch } from "wouter";
import { type CSSProperties, useEffect, useState } from "react";
import { operationsWorkspaceHref, useOperationsWorkspace } from "@/contexts/OperationsWorkspaceContext";

export default function Cases() {
  const { locale, results } = useDemo();
  const isAr = locale === "ar";
  const embeddedInWorkspace = useOperationsWorkspace();
  const persistedResults = trpc.sentinel.persistedResults.useQuery();
  const decisionResults = mergeDecisionResults(results, persistedResults.data ?? []);
  const cases = decisionResults.filter(item => item.case.created).sort((left, right) => reviewPriority(left).rank - reviewPriority(right).rank || right.score - left.score);
  const requestedCaseId = new URLSearchParams(useSearch()).get("id");
  const [decisionFilter, setDecisionFilter] = useState<CaseDecisionFilter>("all");
  const [riskFilter, setRiskFilter] = useState<CaseRiskFilter>("all");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(() => typeof window === "undefined" ? null : window.sessionStorage.getItem("sentinel-selected-case"));
  const requestedCaseExists = Boolean(requestedCaseId && cases.some(item => item.id === requestedCaseId));
  useEffect(() => {
    if (!requestedCaseId || !requestedCaseExists) return;
    setSelectedCaseId(requestedCaseId);
    window.sessionStorage.setItem("sentinel-selected-case", requestedCaseId);
  }, [requestedCaseExists, requestedCaseId]);
  const filteredCases = filterCaseRecords(cases, { decision: decisionFilter, risk: riskFilter });
  const alerts = cases.filter(item => item.alert.created).length;
  const criticalCases = cases.filter(item => item.riskLevel === "Critical").length;
  const selectCase = (id: string) => {
    setSelectedCaseId(id);
    window.sessionStorage.setItem("sentinel-selected-case", id);
  };

  return <SentinelLayout eyebrow={isAr ? "فرز عمليات المراجعة" : "OPERATIONS TRIAGE"} title={isAr ? "الحالات والتنبيهات" : "Cases & alerts"}>
    <section className="case-command-hero"><div><span className="section-index">09</span><p>{isAr ? "لوحة المتابعة البشرية" : "HUMAN REVIEW MONITOR"}</p><h2>{isAr ? "الحالات التي تتطلب متابعة بشرية." : "Cases requiring human follow-up."}</h2><span>{isAr ? "تُعرض الحالات المفتوحة فقط من السجل الدائم ونتائج الجلسة الحالية." : "Open cases are shown from permanent records and the current session."}</span></div><div className="case-command-status"><i /><b>{isAr ? "حالة المراجعة نشطة" : "Review status active"}</b></div></section>
    <section className="case-stat-grid"><article><ShieldAlert size={19} /><span>{isAr ? "حالات مفتوحة" : "Open cases"}</span><b>{String(cases.length).padStart(2, "0")}</b></article><article><FileWarning size={19} /><span>{isAr ? "تنبيهات مسجلة" : "Recorded alerts"}</span><b>{String(alerts).padStart(2, "0")}</b></article><article><Archive size={19} /><span>{isAr ? "خطر حرج" : "Critical risk"}</span><b>{String(criticalCases).padStart(2, "0")}</b></article></section>
    <section className="case-workbench"><header className="case-workbench-head"><div><span>{isAr ? "سجل المتابعة" : "REVIEW REGISTER"}</span><h3>{isAr ? "الحالات مرتبة حسب أولوية المراجع" : "Cases ordered by reviewer priority"}</h3></div><b>{isAr ? `${filteredCases.length} / ${cases.length} حالة` : `${filteredCases.length} / ${cases.length} CASES`}</b></header>{cases.length ? <><div className="case-filter-bar case-workbench-filters" aria-label={isAr ? "تصفية الحالات" : "Filter cases"}><Filter size={16} /><label>{isAr ? "القرار" : "Decision"}<select value={decisionFilter} onChange={event => setDecisionFilter(event.target.value as CaseDecisionFilter)}><option value="all">{isAr ? "كل القرارات" : "All decisions"}</option><option value="Additional Verification">{decisionLabel("Additional Verification", locale)}</option><option value="Temporary Hold">{decisionLabel("Temporary Hold", locale)}</option><option value="Manual Review">{decisionLabel("Manual Review", locale)}</option></select></label><label>{isAr ? "مستوى الخطر" : "Risk level"}<select value={riskFilter} onChange={event => setRiskFilter(event.target.value as CaseRiskFilter)}><option value="all">{isAr ? "كل المستويات" : "All levels"}</option><option value="Medium">{riskLabel("Medium", locale)}</option><option value="High">{riskLabel("High", locale)}</option><option value="Critical">{riskLabel("Critical", locale)}</option></select></label></div>{filteredCases.length ? <div className="case-ticket-list case-filter-transition" key={`${decisionFilter}-${riskFilter}`}>{filteredCases.map((item, index) => { const priority = reviewPriority(item); return <Link href={embeddedInWorkspace ? operationsWorkspaceHref("investigation", item.id) : `/investigation?id=${encodeURIComponent(item.id)}`} key={item.id} onClick={() => selectCase(item.id)} style={{ "--case-filter-delay": `${caseFilterDelay(index)}ms` } as CSSProperties} className={`case-ticket ${riskTone(item.riskLevel)} ${selectedCaseId === item.id ? "is-selected" : ""}`} aria-current={selectedCaseId === item.id ? "true" : undefined}><div className="case-ticket-score"><b>{item.score}</b><span>/100</span></div><div className="case-ticket-subject"><span>{isAr ? "العميل والعملية" : "SUBJECT"}</span><b>{isAr ? item.snapshot.customer.nameAr : item.snapshot.customer.name}</b><p>{sar(item.snapshot.transaction.amount, locale)} · {countryLabel(item.snapshot.transaction.destinationCountry, locale)} · {item.snapshot.transaction.beneficiaryName}</p></div><div className="case-ticket-signals"><span>{isAr ? "الإشارات" : "SIGNALS"}</span><div>{item.factors.slice(0, 2).map(factor => <small key={factor.id}>{isAr ? factor.titleAr : factor.title}</small>)}</div></div><div className="case-ticket-outcome"><span className={`review-priority-chip ${priority.key}`}>{isAr ? priority.ar : priority.en}</span><span className={`level-pill ${riskTone(item.riskLevel)}`}>{riskLabel(item.riskLevel, locale)}</span><b>{decisionLabel(item.decision, locale)}</b></div><ChevronRight size={18} /></Link>; })}</div> : <div className="case-filter-empty">{isAr ? "لا توجد حالات تطابق التصفية الحالية." : "No cases match the current filters."}</div>}</> : <AuditStartPanel icon={Archive} eyebrow={isAr ? "مسار المراجعة" : "REVIEW QUEUE"} title={isAr ? "أنشئ حالة قابلة للمراجعة" : "Create a reviewable case"} description={isAr ? "ستظهر الحالات والتنبيهات بمجرد وصول سيناريو مرتفع المخاطر إلى توصية وقرار معتمد." : "Cases and alerts appear when a high-risk scenario completes the unified risk assessment pipeline."} steps={isAr ? ["شغّل سيناريو مخاطر", "راجع القرار", "افتح القضية"] : ["Run a risk scenario", "Review the decision", "Open the case"]} action={isAr ? "فتح سيناريوهات العرض" : "Open demo scenarios"} href="/bank" />}</section>
  </SentinelLayout>;
}
