import type { Locale } from "./sentinel";
import type { RagCitation } from "./rag";

type CitationTranslation = {
  sourceLanguage: "ar" | "en";
  sectionTitleAr: string;
  sectionTitleEn: string;
  excerptAr: string;
  excerptEn: string;
};

/** Curated display translations only. The RAG excerpt stored in the citation remains the verbatim source record. */
const citationTranslations: Record<string, CitationTranslation> = {
  "sama-risk-assessment-factors": {
    sourceLanguage: "en",
    sectionTitleAr: "القسم 1 — تقييم مخاطر غسل الأموال وتمويل الإرهاب",
    sectionTitleEn: "Section 1 — ML/TF Risk Assessment",
    excerptAr: "تتمثل الخطوة الأساسية لتبني المؤسسة المالية نهجًا قائمًا على المخاطر في تقييم وفهم وتوثيق مخاطر غسل الأموال وتمويل الإرهاب. ويجب أن يشمل التقييم المخاطر الناشئة عن العملاء والملاك المستفيدين والمنتجات والخدمات والعمليات والدول أو المناطق الجغرافية وقنوات الخدمة وعوامل المخاطر الأخرى. ويوضح الدليل أن تدابير الوقاية وتخفيف المخاطر ينبغي أن تتناسب مع نتائج تقييم المخاطر.",
    excerptEn: "The main step for a financial institution to adopt a risk-based approach is to assess, understand and document its ML/TF risks. The risk assessment shall include risks arising from customers and beneficial owners, products, services and transactions, countries or geographical regions, service channels and other risk factors. The Guide states that preventive risk mitigation measures should be commensurate with the results of the risk assessment.",
  },
  "sama-risk-assessment-beneficiary": {
    sourceLanguage: "en",
    sectionTitleAr: "القسم 1.1 — عوامل العميل والمستفيد",
    sectionTitleEn: "Section 1.1 — Customer and beneficiary factors",
    excerptAr: "تشمل عوامل المخاطر المرتبطة بالعملاء أو الملاك المستفيدين أو المستفيدين: المنتجات أو الخدمات المستخدمة، ونوع العمليات المنفذة، وحجم الإيداعات والعمليات، والدول أو المناطق الجغرافية المرتبطة بمصدر العمليات أو وجهتها، وخصائص العميل أو المالك المستفيد أو المستفيد.",
    excerptEn: "Risk factors associated with customers, beneficial owners or beneficiaries include the products or services used, the type of transactions executed, the volume of deposits and transactions, countries or geographical areas related to the source or destination of transactions, and characteristics of the customer, beneficial owner or beneficiary.",
  },
  "sama-monitoring-unusual-activity": {
    sourceLanguage: "en",
    sectionTitleAr: "القسم 7 — مراقبة العمليات والأنشطة",
    sectionTitleEn: "Section 7 — Monitoring of Transactions and Activities",
    excerptAr: "تعد مراقبة العمليات والأنشطة، بما يشمل النشاط غير المعتاد والمشبوه، عنصرًا مهمًا في النهج القائم على المخاطر. وتتحمل المؤسسات المالية مسؤولية المراقبة المستمرة لضمان اتساق العمليات والوثائق والبيانات مع المعلومات المتاحة عن العميل أو علاقة العمل، مع إيلاء اهتمام خاص للنشاط غير المعتاد الذي ينطوي على مخاطر مرتفعة لغسل الأموال وتمويل الإرهاب.",
    excerptEn: "Monitoring transactions and activities, including unusual and suspicious activity, is an important element of a risk-based approach. Financial institutions are responsible for ongoing monitoring to ensure transactions, documents and data are consistent with the information held about the customer or business relationship, with particular attention to unusual activity involving high ML/TF risks.",
  },
  "sama-monitoring-risk-based-tools": {
    sourceLanguage: "en",
    sectionTitleAr: "الأقسام 7.2–7.5 — أدوات المراقبة القائمة على المخاطر",
    sectionTitleEn: "Sections 7.2–7.5 — Risk-based monitoring tools",
    excerptAr: "ينبغي أن يعزّز نهج المراقبة القائم على المخاطر الإشراف على العملاء والعمليات مرتفعة المخاطر، بما يشمل مراجعة العمليات عالية المخاطر والمراقبة المتكررة والتحقيق الداخلي والتحليل المالي للنشاط غير المعتاد. كما ينبغي أن تدعم أدوات الرقابة تحليل العمليات والأنماط والأنشطة غير المعتادة واكتشافها، وأن تتناسب مع طبيعة المؤسسة المالية وحجمها وتعقيد أعمالها.",
    excerptEn: "A risk-based monitoring approach should improve oversight of high-risk customers and transactions, including review of high-risk transactions, frequent monitoring, internal investigation and financial analysis of unusual activity. Supervisory tools should support analysis and detection of unusual transactions, patterns and activities and should be consistent with the nature, size and complexity of the financial institution's business.",
  },
  "sama-wire-beneficiary-context": {
    sourceLanguage: "en",
    sectionTitleAr: "القسم 14.1 — معلومات المُرسِل والمستفيد",
    sectionTitleEn: "Section 14.1 — Originator and beneficiary information",
    excerptAr: "قبل تنفيذ التحويل المالي، ينبغي للمؤسسة المالية الحصول على معلومات المُرسِل والمستفيد والتحقق منها. ويشمل ذلك الاسم الكامل للمستفيد وبيانات حسابه، إضافةً إلى غرض التحويل والعلاقة بين المُرسِل والمستفيد.",
    excerptEn: "Before processing a wire transfer, the financial institution should obtain and verify information about the originator and beneficiary. This includes the beneficiary's full name and account information, as well as the purpose of the wire transfer and the relationship between the originator and beneficiary.",
  },
  "fatf-risk-based-approach": {
    sourceLanguage: "en",
    sectionTitleAr: "توصيات FATF — المنهج القائم على المخاطر",
    sectionTitleEn: "FATF Recommendations — Risk-based approach",
    excerptAr: "يمثل النهج القائم على المخاطر حجر الأساس في توصيات FATF، إذ يؤكد الحاجة إلى تحديد وفهم مخاطر غسل الأموال وتمويل الإرهاب. ويدعم ذلك إعطاء الأولوية للموارد لتخفيف المخاطر في المجالات الأعلى خطورة. وينبغي أن يتكيف التنفيذ مع الظروف الخاصة بكل دولة.",
    excerptEn: "The cornerstone of the FATF Recommendations is the risk-based approach, which emphasizes the need to identify and understand money laundering and terrorist financing risks. This supports prioritising resources to mitigate risks in the highest risk areas. Implementation should be adapted to a country's particular circumstances.",
  },
  "fatf-payment-chain-suspicious-activity": {
    sourceLanguage: "en",
    sectionTitleAr: "توصية 16 المنقحة — معلومات سلسلة الدفع والنشاط المشبوه",
    sectionTitleEn: "Revised R.16 — Payment-chain information and suspicious activity",
    excerptAr: "مع ازدياد تجزؤ سلاسل الدفع، قد لا تتوفر للمؤسسات المالية معلومات كافية لتحديد النشاط المشبوه، وقد تفتقر الجهات المختصة إلى الوصول للمعلومات ذات الصلة. وتوضح توصية 16 المنقحة أدوار سلسلة الدفع وتحسن محتوى وجودة معلومات المُرسِل والمستفيد الأساسية في رسائل الدفع، دعمًا للشفافية وضوابط مكافحة غسل الأموال وتمويل الإرهاب الأكثر فاعلية.",
    excerptEn: "As payment chains have grown more fragmented, financial institutions can have insufficient information to identify suspicious activity and authorities may lack access to relevant information. The updated R.16 clarifies payment-chain roles and improves the content and quality of basic originator and beneficiary information in payment messages to support transparency and more effective AML/CFT controls.",
  },
  "fatf-cross-border-beneficiary-verification": {
    sourceLanguage: "en",
    sectionTitleAr: "توصية 16 المنقحة — معلومات التحويل العابر للحدود",
    sectionTitleEn: "Revised R.16 — Cross-border payment information",
    excerptAr: "في التحويلات العابرة للحدود التي تتجاوز العتبات السارية، ينبغي أن ترافق العملية معلومات المُرسِل والمستفيد الأساسية. وترسل المؤسسة الآمرة معلومات المُرسِل التي تحققت من دقتها، بينما تتحقق المؤسسة المستفيدة من هوية المستفيد عندما لم تكن قد تحققت منها سابقًا وكانت العملية تتجاوز العتبة السارية.",
    excerptEn: "For cross-border payments above applicable thresholds, core originator and beneficiary information should accompany the payment. Ordering institutions send originator information verified for accuracy, while beneficiary institutions verify beneficiary identity where it has not previously been verified and the transfer is above the applicable threshold.",
  },
  "fatf-timely-suspicious-transaction-information": {
    sourceLanguage: "en",
    sectionTitleAr: "تبادل معلومات القطاع الخاص — سياق آني للجريمة المالية",
    sectionTitleEn: "Private-sector information sharing — Timely financial-crime context",
    excerptAr: "قد ترتبط جرائم غسل الأموال وتمويل الإرهاب وغيرها من الجرائم المالية بعدة دول ومؤسسات مالية. وتشير FATF إلى أن المعلومات عن النشاط المالي ذي الصلات المحتملة بالجريمة والإرهاب ينبغي تبادلها بفعالية وفي الوقت المناسب بين القطاعين العام والخاص ومعهما، لدعم الاستجابة للجريمة المالية.",
    excerptEn: "Money laundering, terrorist financing and other financial crime can link several countries and financial institutions. FATF notes that information concerning financial activity with possible links to crime and terrorism should be shared in a timely and effective manner between and with public and private sectors to support the response to financial crime.",
  },
  "sdaia-ai-professional-standards": {
    sourceLanguage: "ar",
    sectionTitleAr: "لمحة عامة عن المعايير المهنية الوطنية",
    sectionTitleEn: "Overview of the national occupational standards",
    excerptAr: "أصدرت سدايا الإطار الوطني للمعايير المهنية للبيانات والذكاء الاصطناعي ليكون مرجعًا أساسيًا للمهتمين بالقطاع، بهدف توحيد وتحسين الممارسات المهنية والتطبيقات المتعلقة بتنمية القدرات البشرية. وتحدد المعايير المهام الرئيسية والمهارات والمعارف والقدرات التي يحتاج إليها الممارس للعمل بهذا المعيار المهني باستمرار.",
    excerptEn: "SDAIA issued the National Occupational Standards Framework for Data and AI as a core reference for the sector. It aims to unify and improve professional practices and applications related to human-capability development, and it identifies the core tasks, skills, knowledge and capabilities needed for continued work to this occupational standard.",
  },
};

export type RagCitationDisplay = {
  sectionTitle: string;
  excerpt: string;
  isTranslated: boolean;
};

export function ragCitationDisplay(citation: RagCitation, locale: Locale): RagCitationDisplay {
  const translation = citationTranslations[citation.chunkId];
  if (!translation) return { sectionTitle: citation.sectionTitle, excerpt: citation.excerpt, isTranslated: false };
  if (translation.sourceLanguage === locale) {
    return { sectionTitle: citation.sectionTitle, excerpt: citation.excerpt, isTranslated: false };
  }
  const isArabic = locale === "ar";
  return {
    sectionTitle: isArabic ? translation.sectionTitleAr : translation.sectionTitleEn,
    excerpt: isArabic ? translation.excerptAr : translation.excerptEn,
    isTranslated: true,
  };
}

export function ragRelevanceSelectionNote(citations: Pick<RagCitation, "authority">[], locale: Locale) {
  const knownAuthorities = ["SAMA", "FATF", "SDAIA"] as const;
  const omitted = knownAuthorities.filter(authority => !citations.some(citation => citation.authority === authority));
  if (!omitted.length) return locale === "ar"
    ? "عُرضت الجهات الرسمية الثلاث لأن مقاطعها تجاوزت عتبة الصلة لهذه العملية."
    : "All three official authorities are shown because their excerpts met the relevance threshold for this transaction.";
  const labels = locale === "ar"
    ? omitted.map(authority => authority === "SDAIA" ? "سدايا" : authority).join(" و")
    : omitted.join(" and ");
  return locale === "ar"
    ? `تُرتَّب المقاطع بحسب صلتها بسياق هذه العملية. لم تُعرض ${labels} لأن مقاطعها لم تتجاوز عتبة الصلة؛ لا يضيف النظام مرجعًا لمجرد تنويع الجهات.`
    : `Excerpts are ranked by relevance to this transaction. ${labels} is not shown because its excerpts did not meet the relevance threshold; the system does not add a source merely for variety.`;
}


export type RagAuditableChainStep = {
  stepIndex: number;
  labelEn: string;
  labelAr: string;
  valueEn: string;
  valueAr: string;
};

export type RagAuditableCitation = {
  citation: RagCitation;
  display: RagCitationDisplay;
  chain: RagAuditableChainStep[];
  officialSourceLabel: string;
  chunkId: string;
  relevancePct: number;
  officialUrl: string;
};

export const RAG_CHAIN_STEPS = [
  { step: 1, labelAr: "مصدر رسمي", labelEn: "Official Source" },
  { step: 2, labelAr: "مقطع محفوظ", labelEn: "Saved Passage" },
  { step: 3, labelAr: "صلة بالسياق", labelEn: "Context Relevance" },
  { step: 4, labelAr: "اقتباس ظاهر", labelEn: "Visible Excerpt" },
  { step: 5, labelAr: "رابط رسمي قابل للمراجعة", labelEn: "Auditable Link" },
] as const;

function authorityLabel(authority: string, locale: Locale): string {
  if (locale === "ar") {
    if (authority === "SAMA") return "ساما";
    if (authority === "SDAIA") return "سدايا";
    return authority;
  }
  return authority;
}

export function buildRagAuditableCitation(citation: RagCitation, locale: Locale): RagAuditableCitation {
  const display = ragCitationDisplay(citation, locale);
  const isAr = locale === "ar";
  const relevancePct = Math.round(citation.similarity * 100);

  const authAr = authorityLabel(citation.authority, "ar");
  const authEn = citation.authority;

  const chain: RagAuditableChainStep[] = [
    {
      stepIndex: 1,
      labelEn: "Official Source",
      labelAr: "مصدر رسمي",
      valueEn: authEn + " (" + citation.titleEn + ")",
      valueAr: authAr + " (" + citation.titleAr + ")",
    },
    {
      stepIndex: 2,
      labelEn: "Saved Passage",
      labelAr: "مقطع محفوظ",
      valueEn: citation.chunkId,
      valueAr: citation.chunkId,
    },
    {
      stepIndex: 3,
      labelEn: "Context Relevance",
      labelAr: "صلة بالسياق",
      valueEn: relevancePct + "% relevance",
      valueAr: "صلة " + relevancePct + "%",
    },
    {
      stepIndex: 4,
      labelEn: "Visible Excerpt",
      labelAr: "اقتباس ظاهر",
      valueEn: display.sectionTitle,
      valueAr: display.sectionTitle,
    },
    {
      stepIndex: 5,
      labelEn: "Auditable Link",
      labelAr: "رابط رسمي قابل للمراجعة",
      valueEn: "Official regulator source",
      valueAr: "المصدر التنظيمي الرسمي",
    },
  ];

  return {
    citation,
    display,
    chain,
    officialSourceLabel: isAr ? authAr + " — " + citation.titleAr : authEn + " — " + citation.titleEn,
    chunkId: citation.chunkId,
    relevancePct,
    officialUrl: citation.officialUrl,
  };
}
