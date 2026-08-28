export type RagLoadingStep = {
  id: "snapshot" | "retrieval" | "response";
  label: string;
  description: string;
};

export function ragLoadingSteps(locale: "ar" | "en"): RagLoadingStep[] {
  return locale === "ar"
    ? [
      { id: "snapshot", label: "قراءة سياق العملية", description: "يثبت المساعد لقطة القرار والعوامل المسجلة." },
      { id: "retrieval", label: "البحث في المراجع الرسمية", description: "يجري استرجاع المقاطع المؤهلة من الفهرس المعتمد." },
      { id: "response", label: "تجهيز رد موثق", description: "يجمع الرد والاستشهادات القابلة للمراجعة." },
    ]
    : [
      { id: "snapshot", label: "Reading the case context", description: "The decision snapshot and recorded factors are fixed." },
      { id: "retrieval", label: "Searching official references", description: "Qualified excerpts are retrieved from the approved index." },
      { id: "response", label: "Preparing a grounded response", description: "The response and reviewable citations are assembled." },
    ];
}
