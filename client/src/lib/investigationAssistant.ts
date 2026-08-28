export function assistantQuestionReady(question: string) {
  return question.trim().length > 0;
}

export function assistantReply(snapshotId: string, decision: string, decisionLabel: string, locale: "ar" | "en") {
  return locale === "ar"
    ? `استجابة توضيحية غير محفوظة: بالاستناد إلى لقطة القرار ${snapshotId}، يبقى القرار «${decisionLabel}» ثابتًا. سؤالك لا يعدّل سجل العملية أو القرار. أي تغيير فعلي يتطلب تشغيل محرك القواعد على مدخلات جديدة.`
    : `Unsaved explanatory response: based on decision snapshot ${snapshotId}, the ${decisionLabel || decision} outcome remains fixed. Your question does not modify the transaction record or decision. Any actual change requires a new rule-engine run with new inputs.`;
}
