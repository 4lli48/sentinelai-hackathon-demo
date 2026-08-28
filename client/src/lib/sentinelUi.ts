import type { Decision, RiskLevel } from "@shared/sentinel";

export function riskTone(level: RiskLevel) {
  return level === "Low" ? "mint" : level === "Medium" ? "amber" : level === "High" ? "rose" : "critical";
}

export function decisionLabel(value: Decision, locale: "en" | "ar") {
  const ar: Record<Decision, string> = { Approve: "موافقة", "Additional Verification": "تحقق إضافي", "Temporary Hold": "إيقاف مؤقت", "Manual Review": "مراجعة يدوية" };
  return locale === "ar" ? ar[value] : value;
}

export function riskLabel(value: RiskLevel, locale: "en" | "ar") {
  const ar: Record<RiskLevel, string> = { Low: "منخفض", Medium: "متوسط", High: "مرتفع", Critical: "حرج" };
  return locale === "ar" ? ar[value] : value;
}

export function sar(value: number, locale: "en" | "ar") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(value);
}

export function countryLabel(value: string, locale: "en" | "ar") {
  if (locale === "en") return value;
  return ({ "Saudi Arabia": "المملكة العربية السعودية", "High-risk jurisdiction": "ولاية عالية المخاطر", Philippines: "الفلبين", Pakistan: "باكستان", UAE: "الإمارات العربية المتحدة", India: "الهند", Turkey: "تركيا" } as Record<string, string>)[value] ?? value;
}

export function mlFeatureLabel(value: string, locale: "en" | "ar") {
  if (locale === "en") return value;
  return ({ "amount-to-baseline deviation": "انحراف عن خط الأساس", "amount pattern near baseline": "نمط مبلغ قريب من الأساس", "known destination corridor": "ممر وجهة معروف", "new destination corridor": "ممر وجهة جديد", "known beneficiary relationship": "علاقة مستفيد معروفة", "new beneficiary relationship": "علاقة مستفيد جديدة", "usual submission hour": "وقت إدخال اعتيادي", "unusual submission hour": "وقت إدخال غير اعتيادي" } as Record<string, string>)[value] ?? value;
}

export function caseStatusLabel(value: "Not required" | "Open", locale: "en" | "ar") {
  return locale === "ar" ? (value === "Open" ? "مفتوحة" : "غير مطلوبة") : value;
}

export function mlLevelLabel(value: "Routine" | "Elevated" | "High", locale: "en" | "ar") {
  return locale === "ar"
    ? ({ Routine: "سلوك اعتيادي", Elevated: "سلوك متوسط", High: "سلوك مرتفع" } as Record<string, string>)[value]
    : ({ Routine: "Routine behaviour", Elevated: "Elevated behaviour", High: "High behaviour" } as Record<string, string>)[value];
}

export function decisionAssessmentExplanation(value: string, locale: "en" | "ar") {
  if (locale === "ar") {
    return value
      .replace(/الإشارة استشارية فقط ولا تغيّر قرار محرك القواعد\.?/g, "تدعم الإشارة قراءة المخاطر داخل الملف.")
      .replace(/إشارة استشارية/g, "إشارة تقييم السلوك");
  }
  return value
    .replace(/The signal is advisory only and does not change the rule engine decision\.?/gi, "The signal supports risk reading within the file.")
    .replace(/advisory signal/gi, "behaviour assessment signal");
}

export function websiteClassLabel(value: "Trusted" | "Needs Review" | "High Risk", locale: "en" | "ar") {
  return locale === "ar" ? ({ Trusted: "موثوق", "Needs Review": "يحتاج مراجعة", "High Risk": "عالي المخاطر" } as Record<string, string>)[value] : value;
}
