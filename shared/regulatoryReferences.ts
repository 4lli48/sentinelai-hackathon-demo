import type { AnalysisResult, Locale, RegulatoryReference } from "./sentinel";

const SAMA_URL = "https://rulebook.sama.gov.sa/en/guidance-anti-money-laundering-and-combating-terrorist-financing";
const FATF_URL = "https://www.fatf-gafi.org/en/topics/fatf-recommendations.html";
const SDAIA_URL = "https://sdaia.gov.sa/ar/Research/Pages/NOSF.aspx";

const baseReferences: Omit<RegulatoryReference, "context" | "contextAr">[] = [
  {
    id: "sama-aml-ctf",
    authority: "SAMA",
    authorityAr: "ساما",
    title: "AML/CTF Guide",
    titleAr: "دليل مكافحة غسل الأموال وتمويل الإرهاب",
    url: SAMA_URL,
  },
  {
    id: "fatf-rba",
    authority: "FATF",
    authorityAr: "FATF",
    title: "FATF Recommendations",
    titleAr: "توصيات مجموعة العمل المالي (FATF)",
    url: FATF_URL,
  },
  {
    id: "sdaia-ai-ethics",
    authority: "SDAIA",
    authorityAr: "سدايا",
    title: "National Occupational Standards Framework for Data and AI",
    titleAr: "الإطار الوطني للمعايير المهنية للبيانات والذكاء الاصطناعي",
    url: SDAIA_URL,
  },
];

export type GovernanceReference = {
  id: string;
  authority: string;
  authorityAr: string;
  title: string;
  titleAr: string;
  url: string;
  useAr: string;
  useEn: string;
  boundaryAr: string;
  boundaryEn: string;
};

export function governanceReferencesFor(): GovernanceReference[] {
  return baseReferences.map(reference => {
    if (reference.id === "sama-aml-ctf") return {
      ...reference,
      useAr: "سياق محلي لمخاطر العملاء والمستفيدين ومراقبة المعاملات.",
      useEn: "Saudi context for customer and beneficiary risk, and transaction monitoring.",
      boundaryAr: "تأصيل الإجراءات الرقابية المعتمدة وتوحيد معايير المراجعة والتدقيق.",
      boundaryEn: "Anchoring approved regulatory procedures and standardizing review and audit criteria.",
    };
    if (reference.id === "fatf-rba") return {
      ...reference,
      useAr: "سياق دولي للمنهج القائم على المخاطر وشفافية التحويلات.",
      useEn: "International context for the risk-based approach and payment transparency.",
      boundaryAr: "تأطير المنهج القائم على المخاطر ومواءمة معايير الشفافية المالية الدولية.",
      boundaryEn: "Framing the risk-based approach and aligning international financial transparency standards.",
    };
    return {
      ...reference,
      useAr: "مرجع وطني لحوكمة القدرات والممارسات المهنية للبيانات والذكاء الاصطناعي.",
      useEn: "National context for professional data and AI capability and practice governance.",
      boundaryAr: "تعزيز الممارسات المهنية المسؤولة وحوكمة تطبيقات الذكاء الاصطناعي والبيانات.",
      boundaryEn: "Promoting responsible professional practices and data and AI governance.",
    };
  });
}

export function regulatoryReferencesFor(result: Omit<AnalysisResult, "report"> | AnalysisResult, locale: Locale): RegulatoryReference[] {
  const isAr = locale === "ar";
  const hasSignals = result.factors.length > 0;
  const signals = result.factors.map(factor => isAr ? factor.titleAr : factor.title).join(isAr ? "، " : ", ");
  return baseReferences.map(reference => {
    if (reference.id === "sama-aml-ctf") {
      return {
        ...reference,
        context: hasSignals
          ? `Saudi regulatory context for risk assessment, due diligence, transaction monitoring, and suspicious-transaction handling relevant to the recorded signals: ${signals}.`
          : "Saudi regulatory context for proportionate risk assessment and routine transaction monitoring.",
        contextAr: hasSignals
          ? `سياق سعودي رسمي لتقييم المخاطر والعناية الواجبة ومراقبة المعاملات والتعامل مع الاشتباه، ويُقرأ بجانب الإشارات المسجلة: ${signals}.`
          : "سياق سعودي رسمي لتقييم المخاطر بصورة متناسبة وللرصد الاعتيادي للمعاملات.",
      };
    }
    if (reference.id === "fatf-rba") {
      return {
        ...reference,
        context: "International reference for the risk-based approach, read alongside Saudi national requirements and the SAMA guidance.",
        contextAr: "مرجع دولي مكمّل للمنهج القائم على المخاطر، ويُقرأ ضمن المتطلبات الوطنية السعودية ودليل ساما.",
      };
    }
    return {
      ...reference,
      context: "Saudi national reference for professional data and AI standards, supporting capability development and consistent professional practices.",
      contextAr: "مرجع سعودي وطني للمعايير المهنية للبيانات والذكاء الاصطناعي، يدعم تنمية القدرات وتوحيد الممارسات المهنية.",
    };
  });
}

export function regulatoryReferenceBrief(result: Omit<AnalysisResult, "report">, locale: Locale): string {
  const references = regulatoryReferencesFor(result, locale);
  const title = locale === "ar" ? "السياق المرجعي المسموح" : "Permitted reference context";
  return `${title}:\n${references.map(reference => `- ${locale === "ar" ? reference.authorityAr : reference.authority}: ${locale === "ar" ? reference.contextAr : reference.context}`).join("\n")}`;
}
