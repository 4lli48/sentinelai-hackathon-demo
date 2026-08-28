export type LiveAnalysisStage = {
  id: string;
  ar: string;
  en: string;
};

export const liveAnalysisStages: LiveAnalysisStage[] = [
  { id: "snapshot", ar: "تثبيت بيانات العملية", en: "Freezing transfer context" },
  { id: "validation", ar: "التحقق من المدخلات", en: "Validating transfer inputs" },
  { id: "policy", ar: "تقييم سياسة المخاطر", en: "Evaluating risk policy" },
  { id: "behaviour", ar: "مقارنة السلوك وخط الأساس", en: "Comparing behaviour and baseline" },
  { id: "advisory", ar: "استدلال الذكاء المحلي للمخاطر", en: "Custom Local AI Risk Analysis" },
  { id: "artifact", ar: "إعداد لقطة القرار", en: "Preparing decision snapshot" },
];

export function liveStageAt(index: number): LiveAnalysisStage {
  return liveAnalysisStages[Math.max(0, Math.min(index, liveAnalysisStages.length - 1))]!;
}
