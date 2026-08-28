import type { AnalysisResult, Locale } from "@shared/sentinel";

export type ReviewerActionKind = "acknowledged" | "information-requested" | "escalated";
export type ReviewerActionEvent = { kind: ReviewerActionKind; note: string; recordedAt: number };
export type ReviewTimelineEvent = { id: string; at: number; kind: string; ar: string; en: string; note?: string };

export function reviewPriority(result: AnalysisResult) {
  if (result.riskLevel === "Critical" || result.decision === "Manual Review") return { key: "immediate", rank: 1, ar: "فورية", en: "Immediate" } as const;
  if (result.riskLevel === "High" || result.decision === "Temporary Hold") return { key: "priority", rank: 2, ar: "عالية", en: "Priority" } as const;
  return { key: "routine", rank: 3, ar: "اعتيادية", en: "Routine" } as const;
}

export function actionLabel(kind: ReviewerActionKind, locale: Locale) {
  const labels = {
    acknowledged: { ar: "تأييد نتيجة المراجعة", en: "Acknowledge review" },
    "information-requested": { ar: "طلب معلومات إضافية", en: "Request information" },
    escalated: { ar: "تصعيد للمراجعة", en: "Escalate for review" },
  } as const;
  return labels[kind][locale];
}

export function reviewTimeline(result: AnalysisResult, actions: ReviewerActionEvent[]) {
  const frozenAt = new Date(result.snapshot.frozenAt).getTime();
  const baseAt = Number.isFinite(frozenAt) ? frozenAt : 0;
  const events: ReviewTimelineEvent[] = [
    { id: "snapshot", at: baseAt, kind: "snapshot", ar: "ثُبّتت لقطة القرار", en: "Decision snapshot frozen" },
    { id: "decision", at: baseAt + 1, kind: "decision", ar: "سجل المحرك القرار الحتمي", en: "Deterministic decision recorded" },
    ...(result.alert.created ? [{ id: "alert", at: baseAt + 2, kind: "alert", ar: "أنشئ تنبيه للمراجعة", en: "Review alert created" }] : []),
    ...(result.case.created ? [{ id: "case", at: baseAt + 3, kind: "case", ar: "فتح ملف القضية", en: "Case file opened" }] : []),
    ...(result.report ? [{ id: "report", at: baseAt + 4, kind: "report", ar: "حُفظ تحليل مقيد باللقطة", en: "Snapshot-bound analysis saved" }] : []),
    ...actions.map((action, index) => ({ id: `action-${index}-${action.recordedAt}`, at: action.recordedAt, kind: "reviewer", ar: actionLabel(action.kind, "ar"), en: actionLabel(action.kind, "en"), note: action.note })),
  ];
  return events.sort((left, right) => left.at - right.at);
}
