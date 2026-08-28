import type { AnalysisResult, Locale } from "@shared/sentinel";
import { CheckCircle2, CircleHelp, Clock3, ShieldAlert, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { actionLabel, type ReviewerActionEvent, type ReviewerActionKind, reviewPriority, reviewTimeline } from "@/lib/reviewWorkflow";

const storageKey = (id: string) => `sentinel-review-actions:${id}`;

function loadActions(id: string): ReviewerActionEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.sessionStorage.getItem(storageKey(id)) ?? "[]") as ReviewerActionEvent[]; } catch { return []; }
}

export function ReviewWorkflowPanel({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const isAr = locale === "ar";
  const [note, setNote] = useState("");
  const [actions, setActions] = useState<ReviewerActionEvent[]>(() => loadActions(result.id));
  const priority = reviewPriority(result);
  const timeline = useMemo(() => reviewTimeline(result, actions), [result, actions]);
  useEffect(() => { setActions(loadActions(result.id)); setNote(""); }, [result.id]);

  const recordAction = (kind: ReviewerActionKind) => {
    const next = [...actions, { kind, note: note.trim(), recordedAt: Date.now() }];
    setActions(next);
    window.sessionStorage.setItem(storageKey(result.id), JSON.stringify(next));
    setNote("");
  };
  const actionOptions: Array<{ kind: ReviewerActionKind; icon: typeof CheckCircle2 }> = [
    { kind: "acknowledged", icon: CheckCircle2 },
    { kind: "information-requested", icon: CircleHelp },
    { kind: "escalated", icon: Upload },
  ];
  return <div className="review-workflow">
    <section className={`review-priority priority-${priority.key}`}><div><span>{isAr ? "أولوية المراجع" : "REVIEW PRIORITY"}</span><b>{isAr ? priority.ar : priority.en}</b></div><p>{isAr ? "مؤشر عرض مشتق من مستوى الخطر والقرار؛ لا يغير النتيجة الحتمية أو الحالة المحفوظة." : "A display indicator derived from risk and decision; it never changes the deterministic outcome or saved case."}</p></section>
    <section className="review-action-panel"><div className="review-section-head"><span>{isAr ? "إجراء المراجع" : "REVIEWER ACTION"}</span><b>{isAr ? "جلسة العرض الحالية" : "CURRENT DEMO SESSION"}</b></div><label htmlFor="reviewer-note">{isAr ? "ملاحظة مختصرة للمراجع (اختيارية)" : "Short reviewer note (optional)"}</label><textarea id="reviewer-note" value={note} onChange={event => setNote(event.target.value)} placeholder={isAr ? "مثال: يلزم التحقق من علاقة المستفيد قبل الإغلاق." : "Example: Verify the beneficiary relationship before closure."} /><div className="review-action-buttons">{actionOptions.map(({ kind, icon: Icon }) => <button type="button" key={kind} onClick={() => recordAction(kind)}><Icon size={15} />{actionLabel(kind, locale)}</button>)}</div><p>{isAr ? "تسجل هذه الإجراءات داخل جلسة العرض فقط ولا تعدل قرار المحرك أو بيانات Supabase." : "These actions are kept for this demo session only and never alter engine decisions or Supabase data."}</p></section>
    <section className="review-timeline"><div className="review-section-head"><span>{isAr ? "التسلسل الزمني" : "REVIEW TIMELINE"}</span><Clock3 size={15} /></div><ol>{timeline.map(event => <li key={event.id} className={`timeline-${event.kind}`}><i>{event.kind === "reviewer" ? <ShieldAlert size={13} /> : <span />}</i><div><b>{isAr ? event.ar : event.en}</b>{event.note ? <p>{event.note}</p> : null}<time>{new Date(event.at).toLocaleString(isAr ? "ar-SA" : "en-US", { dateStyle: "medium", timeStyle: "short" })}</time></div></li>)}</ol></section>
  </div>;
}
