import { createHash } from "node:crypto";

export type RagSeedDocument = {
  id: string;
  authority: "SAMA" | "FATF" | "SDAIA";
  titleAr: string;
  titleEn: string;
  officialUrl: string;
  sourceVersion: string;
  language: "ar" | "en" | "bilingual";
  chunks: Array<{ id: string; language: "ar" | "en"; sectionTitle: string; content: string }>;
};

export function sourceHash(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/**
 * Curated verbatim excerpts from official sources. They are reference context
 * only; they are not rules, scores, or instructions for the decision engine.
 */
export const RAG_SEED_DOCUMENTS: RagSeedDocument[] = [
  {
    id: "sama-mltf-risk-assessment",
    authority: "SAMA",
    titleAr: "دليل مكافحة غسل الأموال وتمويل الإرهاب — تقييم مخاطر ML/TF",
    titleEn: "AML/CTF Guide — ML/TF Risk Assessment",
    officialUrl: "https://rulebook.sama.gov.sa/en/section-1-mltf-risk-assessment",
    sourceVersion: "SAMA Rulebook · In-Force · 2019-11-17 · retrieved 2026-08-18",
    language: "en",
    chunks: [
      {
        id: "sama-risk-assessment-factors",
        language: "en",
        sectionTitle: "Section 1 — ML/TF Risk Assessment",
        content: "The main step for a financial institution to adopt a risk-based approach is to assess, understand and document its ML/TF risks. The risk assessment shall include risks arising from customers and beneficial owners, products, services and transactions, countries or geographical regions, service channels and other risk factors. The Guide states that preventive risk mitigation measures should be commensurate with the results of the risk assessment.",
      },
      {
        id: "sama-risk-assessment-beneficiary",
        language: "en",
        sectionTitle: "Section 1.1 — Customer and beneficiary factors",
        content: "Risk factors associated with customers, beneficial owners or beneficiaries include the products or services used, the type of transactions executed, the volume of deposits and transactions, countries or geographical areas related to the source or destination of transactions, and characteristics of the customer, beneficial owner or beneficiary.",
      },
    ],
  },
  {
    id: "sama-monitoring-transactions",
    authority: "SAMA",
    titleAr: "دليل مكافحة غسل الأموال وتمويل الإرهاب — مراقبة العمليات والأنشطة",
    titleEn: "AML/CTF Guide — Monitoring of Transactions and Activities",
    officialUrl: "https://rulebook.sama.gov.sa/en/section-7-monitoring-transactions-and-activities",
    sourceVersion: "SAMA Rulebook · In-Force · 2019-11-17 · retrieved 2026-08-18",
    language: "en",
    chunks: [
      {
        id: "sama-monitoring-unusual-activity",
        language: "en",
        sectionTitle: "Section 7 — Monitoring of Transactions and Activities",
        content: "Monitoring transactions and activities, including unusual and suspicious activity, is an important element of a risk-based approach. Financial institutions are responsible for ongoing monitoring to ensure transactions, documents and data are consistent with the information held about the customer or business relationship, with particular attention to unusual activity involving high ML/TF risks.",
      },
      {
        id: "sama-monitoring-risk-based-tools",
        language: "en",
        sectionTitle: "Sections 7.2–7.5 — Risk-based monitoring tools",
        content: "A risk-based monitoring approach should improve oversight of high-risk customers and transactions, including review of high-risk transactions, frequent monitoring, internal investigation and financial analysis of unusual activity. Supervisory tools should support analysis and detection of unusual transactions, patterns and activities and should be consistent with the nature, size and complexity of the financial institution's business.",
      },
    ],
  },
  {
    id: "sama-wire-transfer",
    authority: "SAMA",
    titleAr: "دليل مكافحة غسل الأموال وتمويل الإرهاب — التحويلات المالية",
    titleEn: "AML/CTF Guide — Wire Transfer",
    officialUrl: "https://rulebook.sama.gov.sa/en/section-14-wire-transfer",
    sourceVersion: "SAMA Rulebook · In-Force · 2019-11-17 · retrieved 2026-08-18",
    language: "en",
    chunks: [
      {
        id: "sama-wire-beneficiary-context",
        language: "en",
        sectionTitle: "Section 14.1 — Originator and beneficiary information",
        content: "Before processing a wire transfer, the financial institution should obtain and verify information about the originator and beneficiary. This includes the beneficiary's full name and account information, as well as the purpose of the wire transfer and the relationship between the originator and beneficiary.",
      },
    ],
  },
  {
    id: "fatf-recommendations",
    authority: "FATF",
    titleAr: "توصيات FATF — المنهج القائم على المخاطر",
    titleEn: "FATF Recommendations — Risk-based approach",
    officialUrl: "https://www.fatf-gafi.org/en/topics/fatf-recommendations.html",
    sourceVersion: "FATF Recommendations page · retrieved 2026-08-18",
    language: "en",
    chunks: [
      {
        id: "fatf-risk-based-approach",
        language: "en",
        sectionTitle: "FATF Recommendations — Risk-based approach",
        content: "The cornerstone of the FATF Recommendations is the risk-based approach, which emphasizes the need to identify and understand money laundering and terrorist financing risks. This supports prioritising resources to mitigate risks in the highest risk areas. Implementation should be adapted to a country's particular circumstances.",
      },
    ],
  },
  {
    id: "fatf-payment-transparency-r16",
    authority: "FATF",
    titleAr: "FATF — توصية 16: شفافية المدفوعات",
    titleEn: "FATF — Recommendation 16: Payment Transparency",
    officialUrl: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html",
    sourceVersion: "FATF update and explanatory note for revised R.16 · June 2025 · retrieved 2026-08-19",
    language: "en",
    chunks: [
      {
        id: "fatf-payment-chain-suspicious-activity",
        language: "en",
        sectionTitle: "Revised R.16 — Payment-chain information and suspicious activity",
        content: "As payment chains have grown more fragmented, financial institutions can have insufficient information to identify suspicious activity and authorities may lack access to relevant information. The updated R.16 clarifies payment-chain roles and improves the content and quality of basic originator and beneficiary information in payment messages to support transparency and more effective AML/CFT controls.",
      },
      {
        id: "fatf-cross-border-beneficiary-verification",
        language: "en",
        sectionTitle: "Revised R.16 — Cross-border payment information",
        content: "For cross-border payments above applicable thresholds, core originator and beneficiary information should accompany the payment. Ordering institutions send originator information verified for accuracy, while beneficiary institutions verify beneficiary identity where it has not previously been verified and the transfer is above the applicable threshold.",
      },
    ],
  },
  {
    id: "fatf-financial-crime-information-sharing",
    authority: "FATF",
    titleAr: "FATF — تبادل المعلومات لمكافحة الجريمة المالية",
    titleEn: "FATF — Information Sharing to Combat Financial Crime",
    officialUrl: "https://www.fatf-gafi.org/en/publications/Fatfgeneral/Guidance-information-sharing.html",
    sourceVersion: "FATF Private Sector Information Sharing guidance · retrieved 2026-08-19",
    language: "en",
    chunks: [
      {
        id: "fatf-timely-suspicious-transaction-information",
        language: "en",
        sectionTitle: "Private-sector information sharing — Timely financial-crime context",
        content: "Money laundering, terrorist financing and other financial crime can link several countries and financial institutions. FATF notes that information concerning financial activity with possible links to crime and terrorism should be shared in a timely and effective manner between and with public and private sectors to support the response to financial crime.",
      },
    ],
  },
  {
    id: "sdaia-national-standards",
    authority: "SDAIA",
    titleAr: "الإطار الوطني للمعايير المهنية للبيانات والذكاء الاصطناعي",
    titleEn: "National Occupational Standards Framework for Data and AI",
    officialUrl: "https://sdaia.gov.sa/ar/Research/Pages/NOSF.aspx",
    sourceVersion: "SDAIA NOSF page · retrieved 2026-08-18",
    language: "ar",
    chunks: [
      {
        id: "sdaia-ai-professional-standards",
        language: "ar",
        sectionTitle: "لمحة عامة عن المعايير المهنية الوطنية",
        content: "أصدرت سدايا الإطار الوطني للمعايير المهنية للبيانات والذكاء الاصطناعي ليكون مرجعاً أساسياً للمهتمين بالقطاع، بهدف توحيد وتحسين الممارسات المهنية والتطبيقات المتعلقة بتنمية القدرات البشرية. وتحدد المعايير المهام الرئيسية والمهارات والمعارف والقدرات التي يحتاج إليها الممارس للعمل بهذا المعيار المهني باستمرار.",
      },
    ],
  },
];
