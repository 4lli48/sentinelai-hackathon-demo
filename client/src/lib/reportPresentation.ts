export function reportPresentationLabels(
  isAiReport: boolean,
  hasDeterministicCompletion: boolean,
  locale: "ar" | "en",
) {
  const isAr = locale === "ar";
  if (!isAiReport) {
    return {
      title: isAr ? "التقرير الحتمي الآمن" : "Deterministic safety report",
      source: isAr ? "بديل حتمي آمن" : "Deterministic safe fallback",
    };
  }

  return {
    title: isAr ? "تقرير الذكاء الاصطناعي" : "AI analysis report",
    source: hasDeterministicCompletion
      ? (isAr ? "نظام الذكاء الاصطناعي · إكمال حماية حتمي" : "AI system · deterministic safety completion")
      : (isAr ? "نظام الذكاء الاصطناعي" : "AI system"),
  };
}
