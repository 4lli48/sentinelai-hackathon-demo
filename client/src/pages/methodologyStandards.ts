export type MethodologyStandard = {
  id: "sama" | "itu-y3172" | "itu-ai-readiness";
  authority: string;
  authorityAr: string;
  title: string;
  titleAr: string;
  statement: string;
  statementAr: string;
  useEn: string;
  useAr: string;
  boundaryEn: string;
  boundaryAr: string;
  url: string;
};

/** Page-local design references. They inform SentinelAI's methodological alignment and architecture. */
export const methodologyStandards: MethodologyStandard[] = [
  {
    id: "sama",
    authority: "SAMA",
    authorityAr: "ساما",
    title: "AML/CTF Guide",
    titleAr: "دليل مكافحة غسل الأموال وتمويل الإرهاب",
    statement: "The Saudi AML/CTF guide establishes the regulatory foundation for evaluating and monitoring banking transaction risks.",
    statementAr: "يرسخ دليل ساما المحلي الأسس التنظيمية لتقييم مخاطر التحويلات المصرفية والرقابة عليها.",
    useEn: "Provides the regulatory context for due diligence procedures, risk classification, and transaction monitoring.",
    useAr: "يوفر السياق التنظيمي لإجراءات العناية الواجبة وتصنيف المخاطر ومراقبة المعاملات المصرفية.",
    boundaryEn: "Anchoring AML standards and aligning control rules with national banking guidance.",
    boundaryAr: "تأصيل معايير مكافحة غسل الأموال وتوافق قواعد الرقابة مع الإرشادات المصرفية الوطنية.",
    url: "https://rulebook.sama.gov.sa/en/guidance-anti-money-laundering-and-combating-terrorist-financing",
  },
  {
    id: "itu-y3172",
    authority: "ITU-T",
    authorityAr: "ITU-T",
    title: "ITU-T Y.3172 – Architectural framework for machine learning in future networks",
    titleAr: "ITU-T Y.3172 – الإطار المعماري لتعلّم الآلة في شبكات المستقبل",
    statement: "SentinelAI stages have been aligned with the machine-learning lifecycle reflected in the standard.",
    statementAr: "تمت مواءمة مراحل SentinelAI مع دورة تعلم الآلة في المعيار.",
    useEn: "Guides the architectural sequence from intake preparation and context feeding to assessment and evidence recording.",
    useAr: "يوجه الهيكلية الهندسية لتسلسل المراحل من تهيئة المدخلات وتغذية السياق إلى التقييم وتوثيق الأدلة.",
    boundaryEn: "Structuring the data processing pipeline and integrating ML layers with auditable engineering stages.",
    boundaryAr: "تنظيم بنية خط معالجة البيانات وتكامل طبقات تعلم الآلة مع مراحل التدقيق الهندسي.",
    url: "https://www.itu.int/rec/T-REC-Y.3172/en",
  },
  {
    id: "itu-ai-readiness",
    authority: "ITU",
    authorityAr: "ITU",
    title: "ITU AI Readiness Assessment Framework",
    titleAr: "إطار ITU لتقييم الجاهزية للذكاء الاصطناعي",
    statement: "Data, governance, testing, technical architecture, and standards have been considered.",
    statementAr: "تمت مراعاة البيانات، الحوكمة، الاختبار، البنية التقنية والمعايير.",
    useEn: "Supports AI readiness assessment, operational control coverage, transparency, and auditability.",
    useAr: "يدعم تقييم جاهزية الذكاء الاصطناعي وشمولية ضوابط التشغيل والشفافية وقابلية المراجعة.",
    boundaryEn: "Advancing enterprise readiness standards and intelligent solution reliability in financial operations.",
    boundaryAr: "تطوير معايير الجاهزية المؤسسية وموثوقية الحلول الذكية في القطاع المالي.",
    url: "https://aiforgood.itu.int/ai-readiness/",
  },
];
