import { describe, expect, it } from "vitest";
import { methodologyStandards } from "./methodologyStandards";

describe("منهجية SentinelAI — المعايير المرجعية", () => {
  it("تعرض المصادر الرئيسية الثلاثة المطلوبة مع المصدر المحلي القائم", () => {
    expect(methodologyStandards.map(standard => standard.id)).toEqual(["sama", "itu-y3172", "itu-ai-readiness"]);
  });

  it("يحفظ النصين العربيين المطلوبين وروابط ITU الرسمية", () => {
    expect(methodologyStandards.find(standard => standard.id === "itu-y3172")?.statementAr).toBe("تمت مواءمة مراحل SentinelAI مع دورة تعلم الآلة في المعيار.");
    expect(methodologyStandards.find(standard => standard.id === "itu-ai-readiness")?.statementAr).toBe("تمت مراعاة البيانات، الحوكمة، الاختبار، البنية التقنية والمعايير.");
    expect(methodologyStandards.filter(standard => standard.id !== "sama").every(standard => standard.url.startsWith("https://www.itu.int/") || standard.url.startsWith("https://aiforgood.itu.int/"))).toBe(true);
  });
});
