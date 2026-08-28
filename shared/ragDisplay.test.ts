import { describe, expect, it } from "vitest";
import type { RagCitation } from "./rag";
import { ragCitationDisplay, ragRelevanceSelectionNote } from "./ragDisplay";
import { RAG_SEED_DOCUMENTS } from "../server/ragSources";

const samaCitation: RagCitation = {
  chunkId: "sama-wire-beneficiary-context",
  documentId: "sama-wire-transfer",
  authority: "SAMA",
  titleAr: "دليل ساما",
  titleEn: "SAMA Guide",
  officialUrl: "https://rulebook.sama.gov.sa/",
  sectionTitle: "Section 14.1 — Originator and beneficiary information",
  excerpt: "Before processing a wire transfer, the financial institution should obtain and verify information about the originator and beneficiary.",
  similarity: 0.66,
};

describe("عرض الاستشهادات ثنائي اللغة", () => {
  it("يعرض ترجمة عربية للمقطع الإنجليزي من دون تعديل المقتطف المصدر", () => {
    const originalExcerpt = samaCitation.excerpt;
    const display = ragCitationDisplay(samaCitation, "ar");

    expect(display.sectionTitle).toContain("معلومات المُرسِل والمستفيد");
    expect(display.excerpt).toContain("قبل تنفيذ التحويل المالي");
    expect(display.isTranslated).toBe(true);
    expect(samaCitation.excerpt).toBe(originalExcerpt);
  });

  it("يعيد النص الإنجليزي للمقطع الإنجليزي ويفصل ترجمة مقطع سدايا عند العرض الإنجليزي", () => {
    expect(ragCitationDisplay(samaCitation, "en").excerpt).toBe(samaCitation.excerpt);
    const sdaia = { ...samaCitation, chunkId: "sdaia-ai-professional-standards", sectionTitle: "لمحة عامة عن المعايير المهنية الوطنية", excerpt: "أصدرت سدايا الإطار الوطني للمعايير المهنية للبيانات والذكاء الاصطناعي" };
    const englishDisplay = ragCitationDisplay(sdaia, "en");
    expect(englishDisplay.excerpt).toContain("SDAIA issued");
    expect(englishDisplay.isTranslated).toBe(true);
  });

  it("يبقي المقاطع غير المعروفة كما هي بدل إنشاء ترجمة غير موثقة", () => {
    const unknown = { ...samaCitation, chunkId: "unknown-chunk" };
    expect(ragCitationDisplay(unknown, "ar")).toEqual({ sectionTitle: unknown.sectionTitle, excerpt: unknown.excerpt, isTranslated: false });
  });

  it("يوفر عرضًا مقابلًا لكل مقطع رسمي مفهرس في اللغة الأخرى", () => {
    for (const document of RAG_SEED_DOCUMENTS) {
      for (const chunk of document.chunks) {
        const citation: RagCitation = {
          ...samaCitation,
          chunkId: chunk.id,
          documentId: document.id,
          titleAr: document.titleAr,
          titleEn: document.titleEn,
          sectionTitle: chunk.sectionTitle,
          excerpt: chunk.content,
        };
        const oppositeLocale = chunk.language === "ar" ? "en" : "ar";
        const translated = ragCitationDisplay(citation, oppositeLocale);
        expect(translated.excerpt, chunk.id).not.toBe(citation.excerpt);
        expect(translated.isTranslated, chunk.id).toBe(true);
      }
    }
  });

  it("يوضح أن المصدر غير المعروض لم يتجاوز الصلة بدل الادعاء بعدم وجوده", () => {
    expect(ragRelevanceSelectionNote([samaCitation], "ar")).toContain("لم تتجاوز عتبة الصلة");
    expect(ragRelevanceSelectionNote([samaCitation], "en")).toContain("did not meet the relevance threshold");
  });
});
