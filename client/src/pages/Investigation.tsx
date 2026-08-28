import SentinelLayout from "@/components/SentinelLayout";
import { useDemo } from "@/contexts/DemoContext";
import { caseStatusLabel, countryLabel, decisionLabel, mlLevelLabel, riskLabel, sar } from "@/lib/sentinelUi";
import { reportForLocale } from "@/lib/reportLocalization";
import { AuditStartPanel } from "@/components/AuditStartPanel";
import { compositeDecisionFor, ruleAssessmentFor, type AnalysisResult, type InvestigationReport, type RegulatoryReference } from "@shared/sentinel";
import { ArrowLeft, Bot, CheckCircle2, CircleDashed, DatabaseZap, ExternalLink, FileCheck2, Landmark, MessageCirclePlus, MessageSquareText, SendHorizontal, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import { OperationPicker } from "@/components/OperationPicker";
import { operationForId } from "@/lib/operationSelection";
import { mergeDecisionResults } from "@/lib/persistentResults";
import { canRetryReport, latestRetryableQuestion, retriesRemaining } from "@/lib/investigationRetry";
import { averageAiLatency, formatAiLatency, formatAiSessionAverage } from "@/lib/aiLatency";
import { shouldCelebrateAiRefresh } from "@/lib/interactionMotion";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { CustomerPreviousAnalyses } from "@/components/CustomerPreviousAnalyses";
import { ReviewWorkflowPanel } from "@/components/ReviewWorkflowPanel";
import { regulatoryReferencesFor } from "@shared/regulatoryReferences";
import type { RagCitation } from "@shared/rag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { newChatSessionState } from "@/lib/chatSession";
import { ragLoadingSteps } from "@/lib/ragLoading";
import { chatScrollBehavior } from "@/lib/chatScroll";
import { buildRagAuditableCitation, ragCitationDisplay, ragRelevanceSelectionNote } from "@shared/ragDisplay";
import { operationsWorkspaceHref, useOperationsWorkspace } from "@/contexts/OperationsWorkspaceContext";

type ChatMessage = { role: "user" | "assistant"; content: string; source?: "Gemini AI" | "Local AI" | "Deterministic fallback" | "Scope guard"; latencyMs?: number; citations?: RagCitation[] };
type AiFailureLog = { surface: "report" | "chat"; message: string; occurredAt: number };

export default function Investigation() {
  const { results, locale } = useDemo();
  const search = useSearch();
  const selectedId = new URLSearchParams(search).get("id");
  const persistedResults = trpc.sentinel.persistedResults.useQuery();
  const allResults = mergeDecisionResults(results, persistedResults.data ?? []);
  const current = operationForId(allResults, selectedId);
  const isAr = locale === "ar";
  const embeddedInWorkspace = useOperationsWorkspace();
  const [liveReport, setLiveReport] = useState<InvestigationReport | null>(null);
  const resultForReport = current && liveReport ? { ...current, report: liveReport } : current;
  const displayReport = resultForReport ? reportForLocale(resultForReport, locale) : undefined;
  const hasLiveReport = displayReport?.source === "Gemini AI" || displayReport?.source === "Local AI";
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reportRetriesUsed, setReportRetriesUsed] = useState(0);
  const [chatRetriesUsed, setChatRetriesUsed] = useState(0);
  const [lastAiFailure, setLastAiFailure] = useState<AiFailureLog | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null);
  const [ragLoadingStage, setRagLoadingStage] = useState(0);
  const [externalLink, setExternalLink] = useState<{ url: string; label: string } | null>(null);
  const [aiRefreshSucceeded, setAiRefreshSucceeded] = useState(false);
  const loadedHistoryFor = useRef<string | null>(null);
  const chatRequestStartedAt = useRef<number | null>(null);
  const chatListRef = useRef<HTMLDivElement | null>(null);
  const persistedHistory = trpc.sentinel.investigatorHistory.useQuery(
    { transactionId: current?.id ?? "unavailable", snapshotId: current?.snapshot.snapshotId },
    { enabled: Boolean(current?.id) },
  );
  const chat = trpc.sentinel.investigatorChat.useMutation({
    onSuccess: response => {
      const latencyMs = chatRequestStartedAt.current === null ? undefined : performance.now() - chatRequestStartedAt.current;
      chatRequestStartedAt.current = null;
      setMessages(previous => [...previous, { role: "assistant", content: response.answer, source: response.source, latencyMs, citations: response.grounding?.status === "grounded" ? response.grounding.citations : undefined }]);
      setLastAiFailure(response.source === "Gemini AI" || response.source === "Local AI" || response.source === "Scope guard" ? null : { surface: "chat", message: isAr ? "تعذرت الإجابة الحية عن السؤال الأخير؛ يمكنك إعادة المحاولة." : "The latest question did not receive a live response; you can retry it.", occurredAt: Date.now() });
    },
    onError: () => {
      const latencyMs = chatRequestStartedAt.current === null ? undefined : performance.now() - chatRequestStartedAt.current;
      chatRequestStartedAt.current = null;
      setMessages(previous => [...previous, { role: "assistant", source: "Deterministic fallback", latencyMs, content: isAr ? "تعذر إرسال السؤال إلى مسار التحقيق. أعد تحليل العملية ثم حاول مرة أخرى." : "The question could not reach the investigation service. Analyse the transaction again, then retry." }]);
      setLastAiFailure({ surface: "chat", message: isAr ? "تعذر اتصال المحادثة بالخدمة؛ يمكنك إعادة المحاولة." : "The chat service could not be reached; you can retry.", occurredAt: Date.now() });
    },
  });
  const reportRefresh = trpc.sentinel.refreshInvestigationReport.useMutation({
    onSuccess: result => {
      if (result) setLiveReport(result.report);
      setAiRefreshSucceeded(shouldCelebrateAiRefresh(result?.report.source));
      setLastAiFailure(!result || (result.report.source !== "Gemini AI" && result.report.source !== "Local AI") ? { surface: "report", message: isAr ? "تعذر توليد تحليل حي؛ يمكنك إعادة المحاولة." : "A live analysis could not be generated; you can retry.", occurredAt: Date.now() } : null);
    },
    onError: () => setLastAiFailure({ surface: "report", message: isAr ? "تعذر طلب تحليل الذكاء؛ يمكنك إعادة المحاولة." : "The AI analysis request failed; you can retry.", occurredAt: Date.now() }),
  });
  useEffect(() => {
    setQuestion("");
    setMessages([]);
    setReportRetriesUsed(0);
    setChatRetriesUsed(0);
    setLastAiFailure(null);
    setCopiedMessage(null);
    setAiRefreshSucceeded(false);
    chatRequestStartedAt.current = null;
    loadedHistoryFor.current = null;
    setLiveReport(null);
  }, [current?.id]);
  useEffect(() => {
    setLiveReport(null);
  }, [locale]);
  useEffect(() => {
    if (!aiRefreshSucceeded) return;
    const timeout = window.setTimeout(() => setAiRefreshSucceeded(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [aiRefreshSucceeded]);
  useEffect(() => {
    if (!current || !persistedHistory.data || loadedHistoryFor.current === current.id) return;
    setMessages(persistedHistory.data.map(message => ({
      role: message.role,
      content: message.content,
      source: message.role === "assistant"
        ? (message.model_source === "Gemini AI" || message.model_source === "Local AI" ? message.model_source : message.model_source === "Scope guard" ? "Scope guard" : "Deterministic fallback")
        : undefined,
    })));
    loadedHistoryFor.current = current.id;
  }, [current?.id, persistedHistory.data]);
  useEffect(() => {
    const list = chatListRef.current;
    if (!list) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    list.scrollTo({ top: list.scrollHeight, behavior: chatScrollBehavior(messages.length, reducedMotion) });
  }, [messages, chat.isPending]);
  useEffect(() => {
    if (!chat.isPending) {
      setRagLoadingStage(0);
      return;
    }
    setRagLoadingStage(0);
    const interval = window.setInterval(() => setRagLoadingStage(previous => Math.min(previous + 1, 2)), 950);
    return () => window.clearInterval(interval);
  }, [chat.isPending, locale]);
  if (!current && allResults.length) return <SentinelLayout eyebrow={isAr ? "قائمة ملفات التحقيق" : "INVESTIGATION FILES"} title={isAr ? "مكتب التحقيق" : "Investigation desk"}><OperationPicker results={allResults} locale={locale} destination={embeddedInWorkspace ? "/operations?view=investigation" : "/investigation"} investigation /></SentinelLayout>;
  if (!current) return <SentinelLayout eyebrow={isAr ? "تحقيق مقيد باللقطة" : "SNAPSHOT-GROUNDED INVESTIGATION"} title={isAr ? "مساحة التحقيق" : "Investigation workspace"}><AuditStartPanel standalone icon={FileCheck2} eyebrow={isAr ? "ملف أدلة" : "EVIDENCE FILE"} title={isAr ? "ابدأ من لقطة قرار ثابتة" : "Start from a frozen decision snapshot"} description={isAr ? "تظل الأدلة والتفسير محفوظة ضمن سياق قرار واحد قابل للمراجعة." : "Evidence and explanation remain bound to one reviewable decision context."} steps={isAr ? ["حلل التحويل", "ثبّت اللقطة", "افتح التحقيق"] : ["Analyse a transfer", "Freeze the snapshot", "Open investigation"]} action={isAr ? "فتح بوابة التحويل" : "Open bank intake"} href="/bank" /></SentinelLayout>;

  const suggestions = isAr
    ? ["لماذا صُنفت هذه العملية بهذا المستوى من المخاطر؟", "ما أهم عوامل الخطر المسجلة؟", "ما الذي يحتاجه المراجع للتحقق؟", "هل هناك إشارة مرتبطة بالمستفيد؟"]
    : ["Why was this transaction assigned this risk level?", "What are the most important recorded risk factors?", "What should a reviewer verify next?", "Is there a beneficiary-related signal?"];
  const sendQuestion = (rawQuestion: string) => {
    const content = rawQuestion.trim();
    if (!content || chat.isPending) return;
    const history = messages.slice(-8).map(message => ({ role: message.role, content: message.content }));
    setMessages(previous => [...previous, { role: "user", content }]);
    setQuestion("");
    chatRequestStartedAt.current = performance.now();
    chat.mutate({ transactionId: current.id, snapshotId: current.snapshot.snapshotId, sessionResult: current, question: content, locale, history });
  };
  const onSubmit = (event: FormEvent) => { event.preventDefault(); sendQuestion(question); };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendQuestion(question); } };
  const startNewChat = () => {
    const next = newChatSessionState();
    setMessages(next.messages);
    setQuestion(next.question);
    setChatRetriesUsed(next.retriesUsed);
    setCopiedMessage(next.copiedMessage);
    setLastAiFailure(previous => previous?.surface === "chat" ? null : previous);
    chatRequestStartedAt.current = null;
  };
  const retryReport = () => {
    if (reportRefresh.isPending || retriesRemaining(reportRetriesUsed) === 0) return;
    setAiRefreshSucceeded(false);
    setReportRetriesUsed(previous => previous + 1);
    reportRefresh.mutate({ transactionId: current.id, snapshotId: current.snapshot.snapshotId, sessionResult: current, locale });
  };
  const retryableQuestion = latestRetryableQuestion(messages);
  const sessionAverageLatency = averageAiLatency(messages.filter(message => message.role === "assistant").map(message => message.latencyMs));
  const loadingSteps = ragLoadingSteps(locale);
  const activeLoadingStep = loadingSteps[ragLoadingStage];
  const retryQuestion = () => {
    if (!retryableQuestion || chat.isPending || retriesRemaining(chatRetriesUsed) === 0) return;
    setChatRetriesUsed(previous => previous + 1);
    const history = messages.slice(0, -1).slice(-8).map(message => ({ role: message.role, content: message.content }));
    chatRequestStartedAt.current = performance.now();
    chat.mutate({ transactionId: current.id, snapshotId: current.snapshot.snapshotId, sessionResult: current, question: retryableQuestion, locale, history });
  };
  const copyAiResponse = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(index);
      window.setTimeout(() => setCopiedMessage(current => current === index ? null : current), 1800);
    } catch {
      setLastAiFailure({ surface: "chat", message: isAr ? "تعذر نسخ النص من المتصفح." : "The response could not be copied by the browser.", occurredAt: Date.now() });
    }
  };

  return <SentinelLayout eyebrow={isAr ? "التحقيق المدعوم بالأدلة والذكاء" : "AI-POWERED EVIDENCE-BOUND INVESTIGATION"} title={isAr ? "ملف قرار قابل للمراجعة" : "Reviewable decision file"}>
    <Link className="detail-return" href={embeddedInWorkspace ? operationsWorkspaceHref("investigation") : "/investigation"}><ArrowLeft size={16} />{isAr ? "العودة إلى كل العمليات" : "Back to all operations"}</Link>
    <div className="investigation-grid">
      <section className="case-file panel">
        <div className="case-file-head"><div><span className="section-index">08</span><h2>{isAr ? "ملف القضية" : "Case file"}</h2><p>{isAr ? "مصدره لقطة القرار فقط" : "Sourced only from the decision snapshot"}</p></div><span className="case-status"><i /> {caseStatusLabel(current.case.status, locale)}</span></div>
        <div className="evidence-brief"><div><span>{isAr ? "العميل" : "Customer"}</span><b>{isAr ? current.snapshot.customer.nameAr : current.snapshot.customer.name}</b></div><div><span>{isAr ? "التحويل" : "Transfer"}</span><b>{sar(current.snapshot.transaction.amount, locale)}</b></div><div><span>{isAr ? "الوجهة" : "Destination"}</span><b>{countryLabel(current.snapshot.transaction.destinationCountry, locale)}</b></div><div><span>{isAr ? "المستفيد" : "Beneficiary"}</span><b>{current.snapshot.transaction.beneficiaryName}</b></div></div>
        <Tabs defaultValue="evidence" className="case-evidence-tabs"><TabsList aria-label={isAr ? "أقسام ملف القضية" : "Case file sections"}><TabsTrigger value="evidence">{isAr ? "الأدلة" : "Evidence"}</TabsTrigger><TabsTrigger value="context">{isAr ? "السياق" : "Context"}</TabsTrigger><TabsTrigger value="actions">{isAr ? "الإجراءات" : "Actions"}</TabsTrigger></TabsList><TabsContent value="evidence" className="case-tab-content"><CustomerPreviousAnalyses customerId={current.snapshot.customer.id} currentAnalysisId={current.id} locale={locale} /><div className="report-stack"><ReportSection icon={<DatabaseZap size={17} />} title={isAr ? "أدلة العوامل المسجلة" : "Recorded factor evidence"} items={displayReport!.evidence} /></div></TabsContent><TabsContent value="context" className="case-tab-content"><div className="report-stack"><CompositeDecisionReport result={current} locale={locale} /><AiAnalysisSection isAr={isAr} isAvailable={hasLiveReport} isRefreshing={reportRefresh.isPending} showSuccess={aiRefreshSucceeded} canRetry={canRetryReport(displayReport?.source, reportRefresh.isPending, reportRetriesUsed)} canRefresh={!reportRefresh.isPending && retriesRemaining(reportRetriesUsed) > 0} retriesRemaining={retriesRemaining(reportRetriesUsed)} onRetry={retryReport} analysis={displayReport!.analysis} recommendation={displayReport!.aiRecommendation ?? current.aiRecommendation} /><ReferenceSection isAr={isAr} result={resultForReport!} onRequestExternalLink={(url, label) => setExternalLink({ url, label})} /></div></TabsContent><TabsContent value="actions" className="case-tab-content"><div className="report-stack"><ReportSection icon={<FileCheck2 size={17} />} title={isAr ? "الإجراءات المقترحة للمراجع" : "Recommended reviewer actions"} items={displayReport!.actions} /></div><ReviewWorkflowPanel result={current} locale={locale} /></TabsContent></Tabs>
      </section>
      <aside className="simulation-panel panel investigator-chat-panel">
        <div className="simulation-header"><Bot size={20} /><div><span>{isAr ? "مساعد التحقيق بالذكاء الاصطناعي المحلي" : "LOCAL AI INVESTIGATION ASSISTANT"}</span><h3>{isAr ? "محادثة مباشرة عن هذه العملية" : "Live chat about this transaction"}</h3></div><div className="chat-console-actions"><span className="session-latency-chip">{formatAiSessionAverage(sessionAverageLatency, locale)}</span><button type="button" className="chat-new-button" onClick={startNewChat} disabled={chat.isPending}><MessageCirclePlus size={14} />{isAr ? "محادثة جديدة" : "New chat"}</button></div></div>
        <p>{isAr ? "يرسل سؤالك إلى الخادم مع لقطة العملية وسجل المحادثة. يشارك نموذج الذكاء الاصطناعي المحلي في التقييم الموحد وتقديم استدلالات دقيقة ضمن حواجز السياسة الإلزامية." : "Your question is sent with this transaction snapshot and chat context. Custom Local AI participates in unified risk evaluation and detailed inference under mandatory policy guardrails."}</p>
        <div ref={chatListRef} className="chat-message-list" aria-live="polite">{messages.length === 0 ? <div className="chat-empty"><MessageSquareText size={18} /><span>{isAr ? "ابدأ بسؤال أو اختر أحد الأسئلة المقترحة." : "Ask a question or choose a suggested prompt to begin."}</span></div> : messages.map((message, index) => <div className={`chat-message ${message.role} ${message.source === "Scope guard" ? "scope-guard" : ""}`} key={`${message.role}-${index}`}><span className="chat-message-icon">{message.role === "user" ? <UserRound size={14} /> : <Bot size={14} />}</span><div><b>{message.role === "user" ? (isAr ? "أنت" : "You") : (message.source === "Scope guard" ? (isAr ? "تنبيه نطاق المحادثة" : "Conversation scope notice") : "SentinelCore AI")}</b>{message.role === "assistant" && message.latencyMs !== undefined ? <span className="ai-latency">{formatAiLatency(message.latencyMs, locale)}</span> : null}<p>{message.content}</p>{message.citations?.length ? <div className="chat-rag-sources"><span>{isAr ? "مقاطع رسمية مسترجعة" : "Retrieved official excerpts"}</span>{message.citations.map(citation => { const display = ragCitationDisplay(citation, locale); return <button type="button" key={citation.chunkId} onClick={() => setExternalLink({ url: citation.officialUrl, label: isAr ? citation.titleAr : citation.titleEn })}>{citation.authority} · {display.sectionTitle}</button>; })}</div> : null}{message.role === "assistant" ? <button type="button" className="copy-ai-button" onClick={() => copyAiResponse(message.content, index)}>{copiedMessage === index ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ" : "Copy")}</button> : null}</div></div>)}{chat.isPending && <div className="chat-message assistant chat-pending rag-pending" role="status"><div className="rag-pending-head"><span className="rag-pending-orbit" aria-hidden="true"><DatabaseZap size={17} /><i /><i /><i /></span><div><b>{activeLoadingStep.label}</b><p>{activeLoadingStep.description}</p></div></div><ol className="rag-pending-steps" aria-label={isAr ? "مراحل تجهيز الإجابة" : "Response preparation stages"}>{loadingSteps.map((step, index) => <li key={step.id} className={index <= ragLoadingStage ? "is-active" : ""}><i aria-hidden="true">{index + 1}</i><span>{step.label}</span></li>)}</ol></div>}<span className="chat-scroll-anchor" aria-hidden="true" /></div>
        <form className="investigator-chat-form" onSubmit={onSubmit}><label htmlFor="investigator-question">{isAr ? "اكتب سؤالك للمساعد" : "Write your question for the assistant"}</label><textarea id="investigator-question" value={question} onChange={event => setQuestion(event.target.value)} onKeyDown={onKeyDown} disabled={chat.isPending} placeholder={isAr ? "مثال: ما العامل الذي استدعى المراجعة؟" : "Example: Which factor triggered the review?"} /><button className="primary-button" type="submit" disabled={chat.isPending || !question.trim()}><SendHorizontal size={17} />{isAr ? "إرسال السؤال" : "Send question"}</button></form>
        {retryableQuestion ? <button type="button" className="retry-ai-button" onClick={retryQuestion} disabled={chat.isPending || retriesRemaining(chatRetriesUsed) === 0}>↻ {isAr ? `إعادة محاولة آخر سؤال · متبقٍ ${retriesRemaining(chatRetriesUsed)}` : `Retry last question · ${retriesRemaining(chatRetriesUsed)} left`}</button> : null}
        {lastAiFailure ? <div className="ai-failure-log" role="status"><b>{isAr ? "آخر حالة توفر الذكاء" : "Latest AI availability"}</b><span>{lastAiFailure.surface === "report" ? (isAr ? "تقرير التحليل" : "Analysis report") : (isAr ? "محادثة التحقيق" : "Investigation chat")}</span><p>{lastAiFailure.message}</p><time>{new Date(lastAiFailure.occurredAt).toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" })}</time></div> : null}
        <div className="suggested-prompts"><span>{isAr ? "أسئلة مقترحة" : "Suggested questions"}</span><div>{suggestions.map(prompt => <button type="button" key={prompt} disabled={chat.isPending} onClick={() => sendQuestion(prompt)}>{prompt}</button>)}</div></div>
        <div className="integrity-note"><ShieldCheck size={17} /><span>{isAr ? "النتيجة المركبة: " : "Composite outcome: "}<b>{decisionLabel(current.decision, locale)}</b></span></div>
      </aside>
    </div><Dialog open={Boolean(externalLink)} onOpenChange={open => { if (!open) setExternalLink(null); }}><DialogContent className="external-confirm-dialog"><DialogTitle>{isAr ? "فتح مصدر خارجي؟" : "Open an external source?"}</DialogTitle><DialogDescription>{isAr ? "ستنتقل إلى مصدر رسمي في علامة تبويب جديدة خارج SentinelAI." : "You will open an official source in a new tab outside SentinelAI."}</DialogDescription><p className="external-confirm-url">{externalLink?.label}</p><DialogFooter><button type="button" className="secondary-button" onClick={() => setExternalLink(null)}>{isAr ? "إلغاء" : "Cancel"}</button><button type="button" className="primary-button" onClick={() => { if (externalLink) window.open(externalLink.url, "_blank", "noopener,noreferrer"); setExternalLink(null); }}>{isAr ? "متابعة إلى المصدر" : "Continue to source"}</button></DialogFooter></DialogContent></Dialog>
  </SentinelLayout>;
}

function CompositeDecisionReport({ result, locale }: { result: AnalysisResult; locale: "ar" | "en" }) {
  const isAr = locale === "ar";
  const override = isAr ? result.policyOverrideAr : result.policyOverride;
  const ruleAssessment = ruleAssessmentFor(result);
  const compositeDecision = compositeDecisionFor(result);
  const outcomeLabel = compositeDecision.outcome === "ai_escalated" ? (isAr ? "صعّد الذكاء النتيجة" : "AI escalated") : compositeDecision.outcome === "aligned" ? (isAr ? "اتفاق التقييمين" : "Assessments aligned") : compositeDecision.outcome === "policy_guardrail" ? (isAr ? "حاجز سياسة إلزامي" : "Mandatory policy guardrail") : compositeDecision.outcome === "rule_guardrail" ? (isAr ? "حد أمان القواعد" : "Rule safety floor") : (isAr ? "توصية الذكاء غير متاحة" : "AI recommendation unavailable");
  return <section className="report-section deterministic-decision-report"><h3><ShieldCheck size={17} />{isAr ? "القرار المركب" : "Composite decision"}</h3><p>{isAr ? "تقدم القواعد حد السياسة، ويشارك نموذج الذكاء الاصطناعي المحلي الخاص في التقييم والتوصية. لا يمكن خفض الحواجز أو تجاوز سياسة إلزامية." : "Rules provide the policy floor and the proprietary Custom-Trained Local AI participates in risk evaluation and recommendation. Safety floors and mandatory policy controls cannot be lowered or bypassed."}</p><div className="decision-fact-grid"><div><span>{isAr ? "تقييم القواعد" : "Rule assessment"}</span><b>{decisionLabel(ruleAssessment.decision, locale)}</b></div><div><span>{isAr ? "النتيجة المركبة" : "Composite outcome"}</span><b>{decisionLabel(compositeDecision.finalDecision, locale)}</b></div><div><span>{isAr ? "الدرجة المركبة" : "Composite score"}</span><b>{compositeDecision.finalScore}/100</b></div><div><span>{isAr ? "حالة الدمج" : "Combination status"}</span><b>{outcomeLabel}</b></div></div><p>{isAr ? `إشارة تقييم السلوك والشذوذ بدرجة ${result.mlSignal.score}/100 ومستوى ${mlLevelLabel(result.mlSignal.level, locale)} تغذي استدلال نموذج الذكاء المحلي: ${result.mlSignal.explanationAr}` : `The ${result.mlSignal.score}/100 ${mlLevelLabel(result.mlSignal.level, locale)} behaviour assessment signal informs Custom Local AI inference: ${result.mlSignal.explanation}`}</p>{override ? <p className="policy-override-copy"><b>{isAr ? "تجاوز السياسة: " : "Policy override: "}</b>{override}</p> : null}</section>;
}

function AiAnalysisSection({ isAr, isAvailable, isRefreshing, showSuccess, canRetry, canRefresh, retriesRemaining, onRetry, analysis, recommendation }: { isAr: boolean; isAvailable: boolean; isRefreshing: boolean; showSuccess: boolean; canRetry: boolean; canRefresh: boolean; retriesRemaining: number; onRetry: () => void; analysis: string; recommendation?: InvestigationReport["aiRecommendation"] }) {
  const unavailable = isAr ? "يتوفر هنا التحليل النصي والاستدلال التفصيلي لنموذج الذكاء الاصطناعي المحلي عند اكتمال مسار المعالجة. تظل أدلة العوامل والحواجز الرقابية صالحة ومحفوظة للمراجعة." : "Detailed narrative and inference from the custom Local AI model appear here upon processing. Factor evidence and regulatory guardrails remain permanently reviewable.";
  return <section className="report-section ai-analysis-section"><h3><Sparkles size={17} />{isAr ? "استدلال وتوصية نموذج الذكاء المحلي" : "Custom Local AI Recommendation & Inference"}</h3>{recommendation?.availability === "available" ? <div className="ai-decision-grid"><div><span>{isAr ? "التوصية" : "Recommendation"}</span><b>{decisionLabel(recommendation.decision, isAr ? "ar" : "en")}</b></div><div><span>{isAr ? "درجة الذكاء" : "AI score"}</span><b>{recommendation.score}/100</b></div><div><span>{isAr ? "الثقة" : "Confidence"}</span><b>{recommendation.confidence}%</b></div></div> : null}<p>{isAvailable ? analysis : unavailable}</p>{recommendation?.availability === "available" ? <p className="ai-rationale"><b>{isAr ? "مبرر التوصية: " : "Recommendation rationale: "}</b>{recommendation.rationale}</p> : null}<span className={`analysis-source-chip ${isAvailable ? "live" : "unavailable"}`}>{isAvailable ? (isAr ? "استدلال محفوظ من نموذج الذكاء الاصطناعي المحلي" : "Saved Custom Local AI inference") : isRefreshing ? (isAr ? "جارٍ تحديث استدلال الذكاء المحلي…" : "Refreshing Local AI inference…") : (isAr ? "استدلال الذكاء المحلي غير متاح حاليًا" : "Local AI inference currently unavailable")}</span>{showSuccess ? <div className="ai-refresh-success" role="status"><CheckCircle2 size={16} /><span>{isAr ? "اكتمل تحديث استدلال الذكاء بنجاح" : "Local AI inference refreshed successfully"}</span></div> : null}{isAvailable && canRefresh ? <button type="button" className="retry-ai-button report-retry-button manual-refresh-button" onClick={onRetry}>↻ {isAr ? `تحديث التوصية المحفوظة · متبقٍ ${retriesRemaining}` : `Refresh saved recommendation · ${retriesRemaining} left`}</button> : null}{canRetry ? <button type="button" className="retry-ai-button report-retry-button" onClick={onRetry}>↻ {isAr ? `إعادة محاولة التوصية · متبقٍ ${retriesRemaining}` : `Retry recommendation · ${retriesRemaining} left`}</button> : null}</section>;
}

function ReportSection({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) { return <section className="report-section"><h3>{icon}{title}</h3>{items.map((item, index) => <p key={index}>{item}</p>)}</section>; }

function GroundedCitationList({ citations, isAr, onRequestExternalLink }: { citations: RagCitation[]; isAr: boolean; onRequestExternalLink: (url: string, label: string) => void }) {
  const locale = isAr ? "ar" : "en";
  return <div className="rag-citation-list">{citations.map(citation => {
    const item = buildRagAuditableCitation(citation, locale);
    const display = item.display;
    return <article className="rag-citation-card rag-traceability-card" key={citation.chunkId}>
      <div className="rag-traceability-stepper" aria-label={isAr ? "سلسلة إثبات المصدر القابلة للمراجعة" : "Auditable traceability chain"}>
        <div className="rag-step-pill">
          <span className="rag-step-num">1</span>
          <span className="rag-step-name">{isAr ? "مصدر رسمي" : "Official Source"}</span>
          <b>{citation.authority}</b>
        </div>
        <span className="rag-step-arrow" aria-hidden="true">→</span>
        <div className="rag-step-pill">
          <span className="rag-step-num">2</span>
          <span className="rag-step-name">{isAr ? "مقطع محفوظ" : "Saved Passage"}</span>
          <code className="rag-step-code">{citation.chunkId}</code>
        </div>
        <span className="rag-step-arrow" aria-hidden="true">→</span>
        <div className="rag-step-pill">
          <span className="rag-step-num">3</span>
          <span className="rag-step-name">{isAr ? "صلة بالسياق" : "Context Relevance"}</span>
          <b className="rag-relevance-badge">{item.relevancePct}%</b>
        </div>
        <span className="rag-step-arrow" aria-hidden="true">→</span>
        <div className="rag-step-pill">
          <span className="rag-step-num">4</span>
          <span className="rag-step-name">{isAr ? "اقتباس ظاهر" : "Visible Excerpt"}</span>
        </div>
        <span className="rag-step-arrow" aria-hidden="true">→</span>
        <div className="rag-step-pill rag-step-link">
          <span className="rag-step-num">5</span>
          <span className="rag-step-name">{isAr ? "رابط رسمي" : "Auditable Link"}</span>
        </div>
      </div>

      <div className="rag-citation-head">
        <div className="rag-citation-authority-badge">
          <span>{citation.authority === "SDAIA" && isAr ? "سدايا" : citation.authority}</span>
          <b>{isAr ? citation.titleAr : citation.titleEn}</b>
        </div>
        <span className="rag-similarity-chip">
          {isAr ? "صلة " + item.relevancePct + "%" : item.relevancePct + "% relevance"}
        </span>
      </div>

      <div className="rag-citation-section-title">
        <small>{isAr ? "عنوان القسم التنظيمي:" : "Regulatory Section:"}</small>
        <h4>{display.sectionTitle}</h4>
      </div>

      <blockquote className="rag-citation-quote">
        <p>{display.excerpt}</p>
      </blockquote>

      {display.isTranslated ? <em className="rag-citation-translation-note">{isAr ? "عرض مترجم؛ يبقى النص الرسمي محفوظًا في سجل المصدر." : "Translated display; the original official excerpt remains preserved in source record."}</em> : null}

      <div className="rag-citation-footer">
        <span className="rag-chunk-tag">
          <code>ID: {citation.chunkId}</code>
        </span>
        <button type="button" className="external-reference-link rag-external-btn" onClick={() => onRequestExternalLink(citation.officialUrl, isAr ? citation.titleAr : citation.titleEn)}>
          <ExternalLink size={12} aria-hidden="true" />
          {isAr ? "فتح المصدر الرسمي القابل للمراجعة" : "Open official auditable source"}
          <span className="external-link-hint">{isAr ? "خارج التطبيق" : "External"}</span>
        </button>
      </div>
    </article>;
  })}</div>;
}

function ReferenceSection({ isAr, result, onRequestExternalLink }: { isAr: boolean; result: AnalysisResult; onRequestExternalLink: (url: string, label: string) => void }) {
  const references = regulatoryReferencesFor(result, isAr ? "ar" : "en");
  const normalized = (references as unknown[]).map((reference, index): RegulatoryReference => typeof reference === "string" ? { id: "sdaia-ai-ethics", authority: "SDAIA", authorityAr: "سدايا", title: reference, titleAr: reference, url: "", context: "Legacy demo reference.", contextAr: "مرجع تجريبي سابق." } : reference as RegulatoryReference);
  const citations = result.report.rag?.status === "grounded" ? result.report.rag.citations : [];
  return <section className="report-section reference-section">
    <h3><Landmark size={17} />{isAr ? "المراجع التنظيمية وإثبات مصدر السياق (RAG)" : "Regulatory references & RAG context grounding"}</h3>
    {citations.length ? <>
      <div className="rag-traceability-banner">
        <ShieldCheck size={16} />
        <div>
          <b>{isAr ? "سلسلة إثبات مصدر السياق (RAG Traceability Chain)" : "RAG Source Traceability Chain"}</b>
          <p>{isAr ? "تثبت هذه السلسلة مصدر المعرفة والسياق التنظيمي المعتمد المسترجع عبر RAG والمزوّد لنموذج الذكاء المحلي أثناء تقييم المخاطر، كدليل تدقيق مرئي يربط التوصية بمرجعها الرسمي." : "This chain verifies the approved regulatory knowledge retrieved via RAG and fed to the custom Local AI model during risk evaluation, providing an auditable visual trace linking the recommendation to its official source."}</p>
        </div>
      </div>
      <p className="rag-relevance-note"><CircleDashed size={14} />{ragRelevanceSelectionNote(citations, isAr ? "ar" : "en")}</p>
      <GroundedCitationList citations={citations} isAr={isAr} onRequestExternalLink={onRequestExternalLink} />
    </> : <>
      <p className="reference-disclosure">{isAr ? "مراجع رسمية مختارة لدعم قراءة الأدلة وتقييم المخاطر." : "Selected official references support evidence reading and risk assessment."}</p>
      <div className="reference-list">{normalized.map((reference, index) => <div className="reference-card" key={reference.id + "-" + index}><span>{isAr ? reference.authorityAr : reference.authority}</span><div><b>{isAr ? reference.titleAr : reference.title}</b><p>{isAr ? reference.contextAr : reference.context}</p>{reference.url ? <a className="external-reference-link" href={reference.url} onClick={event => { event.preventDefault(); onRequestExternalLink(reference.url, isAr ? reference.titleAr : reference.title); }} title={isAr ? "يفتح مصدرًا رسميًا في صفحة جديدة" : "Opens an official source in a new tab"}><ExternalLink size={12} aria-hidden="true" />{isAr ? "فتح المصدر الرسمي" : "Open official source"}<span className="external-link-hint">{isAr ? "خارج التطبيق" : "External"}</span></a> : null}</div></div>)}</div>
    </>}
  </section>;
}
