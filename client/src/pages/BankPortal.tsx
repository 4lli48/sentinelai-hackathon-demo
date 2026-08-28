import SentinelLayout from "@/components/SentinelLayout";
import { useDemo } from "@/contexts/DemoContext";
import { destinations, draftForScenario, isDraftReady, newManualDraft, type TransferDraft } from "@/lib/bankIntake";
import { liveAnalysisStages, liveStageAt } from "@/lib/liveAnalysis";
import { trpc } from "@/lib/trpc";
import type { TransactionInput } from "@shared/sentinel";
import { ArrowRight, CheckCircle2, CircleDashed, Copy, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";

const transferTypes: TransactionInput["transactionType"][] = ["Local Transfer", "International Transfer", "Merchant Payment", "Personal Transfer"];
const transferTypeAr: Record<TransactionInput["transactionType"], string> = { "Local Transfer": "تحويل محلي", "International Transfer": "تحويل دولي", "Merchant Payment": "دفع لتاجر", "Personal Transfer": "تحويل شخصي" };
const minimumLiveExperienceMs = 1750;
const liveStageIntervalMs = 620;

export default function BankPortal() {
  const { locale, pushResult } = useDemo();
  const isAr = locale === "ar";
  const [, navigate] = useLocation();
  const search = useSearch();
  const boot = trpc.sentinel.bootstrap.useQuery();
  const analyze = trpc.sentinel.analyze.useMutation();
  const [input, setInput] = useState<TransferDraft>(() => newManualDraft());
  const [beneficiaryMode, setBeneficiaryMode] = useState<"known" | "new">("known");
  const [liveStageIndex, setLiveStageIndex] = useState<number | null>(null);
  const intakeRef = useRef<HTMLElement>(null);
  const customerRef = useRef<HTMLSelectElement>(null);
  const progressTimerRef = useRef<number | null>(null);
  const [scenarioLoaded, setScenarioLoaded] = useState(false);
  const loadedScenarioFromLink = useRef<string | null>(null);
  const knownBeneficiaries = Array.from(new Set(boot.data?.customers.flatMap(customer => customer.trustedBeneficiaries) ?? []));
  const isComplete = isDraftReady(input);
  const isRunning = liveStageIndex !== null;
  const currentStage = liveStageIndex === null ? null : liveStageAt(liveStageIndex);

  useEffect(() => () => {
    if (progressTimerRef.current !== null) window.clearInterval(progressTimerRef.current);
  }, []);

  const clearProgressTimer = () => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const update = <K extends keyof TransferDraft>(key: K, value: TransferDraft[K]) => setInput(prev => ({ ...prev, [key]: value, submittedAt: undefined }));
  const clearForm = () => {
    if (isRunning) return;
    setInput(newManualDraft());
    setBeneficiaryMode("known");
  };

  const chooseScenario = (scenario: TransactionInput) => {
    if (isRunning) return;
    const nextDraft = draftForScenario(scenario);
    setInput(nextDraft);
    setBeneficiaryMode(knownBeneficiaries.includes(nextDraft.beneficiaryName) ? "known" : "new");
    setScenarioLoaded(true);
    window.setTimeout(() => setScenarioLoaded(false), 1100);
    window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      intakeRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      window.setTimeout(() => customerRef.current?.focus({ preventScroll: true }), reducedMotion ? 0 : 360);
    });
  };

  useEffect(() => {
    const scenarioId = new URLSearchParams(search).get("scenario");
    if (!scenarioId || loadedScenarioFromLink.current === scenarioId || !boot.data?.scenarios) return;
    const scenario = boot.data.scenarios.find(item => item.id === scenarioId);
    if (!scenario) return;
    loadedScenarioFromLink.current = scenarioId;
    chooseScenario(scenario.input);
  }, [boot.data?.scenarios, search]);

  const runAnalysis = async () => {
    if (!isComplete || isRunning) return;
    analyze.reset();
    setLiveStageIndex(0);
    const startedAt = Date.now();
    let localStage = 0;
    progressTimerRef.current = window.setInterval(() => {
      localStage = Math.min(localStage + 1, liveAnalysisStages.length - 2);
      setLiveStageIndex(localStage);
    }, liveStageIntervalMs);

    try {
      const result = await analyze.mutateAsync({ ...input, transactionType: input.transactionType as TransactionInput["transactionType"], locale });
      clearProgressTimer();
      setLiveStageIndex(liveAnalysisStages.length - 1);
      const remaining = Math.max(0, minimumLiveExperienceMs - (Date.now() - startedAt));
      window.setTimeout(() => {
        pushResult(result);
        navigate(`/analysis?id=${encodeURIComponent(result.id)}`);
      }, remaining);
    } catch {
      clearProgressTimer();
      setLiveStageIndex(null);
    }
  };

  return <SentinelLayout eyebrow={isAr ? "تشغيل التحويل" : "TRANSFER OPERATIONS"} title={isAr ? "محطة إدخال التحويل" : "Transfer command station"}>
    <section className="intake-command-header"><div><span className="section-index">01</span><p>{isAr ? "مسار إدخال مستقل" : "A dedicated intake workflow"}</p><h2>{isAr ? "أدخل التحويل ثم راقب قرارًا قابلاً للمراجعة." : "Enter the transfer, then follow an inspectable decision."}</h2></div><div className="intake-step-strip" aria-label={isAr ? "مراحل رحلة التحويل" : "Transfer journey stages"}><span className="is-active"><i>01</i>{isAr ? "الإدخال" : "Input"}</span><span><i>02</i>{isAr ? "القرار" : "Decision"}</span><span><i>03</i>{isAr ? "المراجعة" : "Review"}</span></div></section>
    <div className="intake-command-layout">
      <section className={`transfer-workspace${scenarioLoaded ? " scenario-loaded" : ""}`} ref={intakeRef}>
        <div className="transfer-workspace-head"><div><p>{isAr ? "تحويل جديد" : "NEW TRANSFER"}</p><h3>{isAr ? "أدخل الأطراف وقيمة العملية" : "Enter the parties and transaction value"}</h3></div><span className="live-dot"><i /> {isRunning ? (isAr ? "تحليل حي قيد التنفيذ" : "Live analysis in progress") : isComplete ? (isAr ? "جاهز للتحليل" : "Ready for analysis") : (isAr ? "أكمل البيانات الإلزامية" : "Complete required details")}</span></div>

        {currentStage && <section className="analysis-live" aria-live="polite" aria-label={isAr ? "تقدم تحليل التحويل" : "Transfer analysis progress"}>
          <div className="analysis-live-head"><div><span className="analysis-live-kicker"><CircleDashed className="spin" size={15} /> {isAr ? "تحليل مباشر" : "LIVE ANALYSIS"}</span><strong>{isAr ? currentStage.ar : currentStage.en}</strong></div><span>{Math.round(((liveStageIndex! + 1) / liveAnalysisStages.length) * 100)}%</span></div>
          <div className="analysis-stage-track">{liveAnalysisStages.map((stage, index) => <div className={`analysis-stage${index < liveStageIndex! ? " done" : ""}${index === liveStageIndex ? " active" : ""}`} key={stage.id}><i>{index < liveStageIndex! ? <CheckCircle2 size={13} /> : String(index + 1).padStart(2, "0")}</i><span>{isAr ? stage.ar : stage.en}</span></div>)}</div>
          <p>{isAr ? "تُحلل إشارات السلوك والقواعد التنظيمية وتُغذى إلى نموذج الذكاء المحلي الخاص ضمن مسار التقييم الموحد." : "Behavioral signals and regulatory rules are analyzed and fed to the custom Local AI model within the unified risk assessment pipeline."}</p>
        </section>}

        <div className="transfer-form-guide"><span>01</span><div><b>{isAr ? "الأطراف" : "Parties"}</b><p>{isAr ? "ابدأ بالعميل والمستفيد، ثم أضف بيانات العملية." : "Start with the customer and beneficiary, then add the transfer details."}</p></div></div>
        <fieldset className="transfer-form" disabled={isRunning}>
          <label>{isAr ? "العميل" : "Customer"}<select ref={customerRef} value={input.customerId} onChange={e => update("customerId", e.target.value)}><option value="" disabled>{isAr ? "اختر العميل" : "Select customer"}</option>{boot.data?.customers.map(customer => <option value={customer.id} key={customer.id}>{isAr ? customer.nameAr : customer.name}</option>)}</select></label>
          <label>{isAr ? "المبلغ" : "Amount (SAR)"}<input type="number" min="1" placeholder={isAr ? "أدخل المبلغ" : "Enter amount"} value={input.amount || ""} onChange={e => update("amount", Number(e.target.value))} /></label>
          <label>{isAr ? "بلد الوجهة" : "Destination"}<select value={input.destinationCountry} onChange={e => update("destinationCountry", e.target.value)}><option value="" disabled>{isAr ? "اختر البلد" : "Select destination"}</option>{destinations.map(destination => <option value={destination.value} key={destination.value}>{isAr ? destination.ar : destination.en}</option>)}</select></label>
          <label>{isAr ? "المستفيد" : "Beneficiary"}<select value={beneficiaryMode === "new" ? "__new__" : input.beneficiaryName} onChange={e => { const value = e.target.value; if (value === "__new__") { setBeneficiaryMode("new"); update("beneficiaryName", ""); } else { setBeneficiaryMode("known"); update("beneficiaryName", value); } }}><option value="" disabled>{isAr ? "اختر مستفيدًا" : "Select beneficiary"}</option>{knownBeneficiaries.map(name => <option value={name} key={name}>{name}</option>)}<option value="__new__">{isAr ? "＋ إضافة مستفيد جديد" : "＋ Add new beneficiary"}</option></select>{beneficiaryMode === "new" && <input className="new-beneficiary-input" placeholder={isAr ? "اسم المستفيد الجديد" : "New beneficiary name"} value={input.beneficiaryName} onChange={e => update("beneficiaryName", e.target.value)} />}</label>
          <label>{isAr ? "نوع التحويل" : "Transfer type"}<select value={input.transactionType} onChange={e => update("transactionType", e.target.value as TransferDraft["transactionType"])}><option value="" disabled>{isAr ? "اختر نوع التحويل" : "Select transfer type"}</option>{transferTypes.map(type => <option value={type} key={type}>{isAr ? transferTypeAr[type] : type}</option>)}</select></label>
          <label>{isAr ? "الموقع الإلكتروني · اختياري" : "Website domain · optional"}<input placeholder="merchant.example" value={input.websiteDomain ?? ""} onChange={e => update("websiteDomain", e.target.value || undefined)} /></label>
        </fieldset>
        <div className="transfer-workspace-footer"><p><LockKeyhole size={15} /> {isAr ? "يصدر القرار عبر مسار موحد يجمع حواجز القواعد واستدلال الذكاء المحلي الخاص وتوصيات RAG التنظيمية." : "The decision is generated through a unified pipeline combining rule guardrails, Custom Local AI inference, and RAG regulatory context."}</p><div className="intake-actions"><button className="secondary-button" type="button" disabled={isRunning} onClick={clearForm}><RotateCcw size={16} />{isAr ? "إدخال جديد" : "New transfer"}</button><button className="primary-button" disabled={isRunning || !isComplete} onClick={runAnalysis}>{isRunning ? <CircleDashed className="spin" size={18} /> : <ArrowRight size={18} />}{isRunning ? (isAr ? "جارٍ تشغيل مراحل التحليل…" : "Running analysis stages…") : (isAr ? "تحليل التحويل" : "Analyse transfer")}</button></div></div>
        {analyze.error && <p className="error-note">{isAr ? "تعذر إكمال التحليل. حاول مرة أخرى." : "Analysis could not be completed. Please retry."}</p>}
      </section>
      <aside className="scenario-launchpad"><div className="scenario-heading"><Sparkles size={17} /><div><p>{isAr ? "تشغيل سريع" : "QUICK START"}</p><h3>{isAr ? "تحميل سيناريو الاختبار" : "Load a test narrative"}</h3><span>{isAr ? "أو استخدم الحقول اليدوية في مساحة الإدخال." : "Or use the manual fields in the intake workspace."}</span></div></div><div className="scenario-stack">{boot.data?.scenarios.map((scenario, index) => <button className="scenario-choice" disabled={isRunning} key={scenario.id} onClick={() => chooseScenario(scenario.input)}><span className="scenario-number">{String(index + 1).padStart(2, "0")}</span><span><b>{isAr ? scenario.titleAr : scenario.title}</b><small>{isAr ? "تحميل المعطيات في مساحة الإدخال" : "Load inputs into the workspace"}</small></span><Copy size={15} /></button>)}</div><div className="scenario-foot"><CheckCircle2 size={16} /><span>{isAr ? "كل سيناريو يعيد استخدام بيانات عرض معزولة." : "Every scenario reuses isolated demo data."}</span></div></aside>
    </div>
  </SentinelLayout>;
}
