import { describe, it, expect } from "vitest";
import { buildRagAuditableCitation, RAG_CHAIN_STEPS, ragCitationDisplay } from "./ragDisplay";
import type { RagCitation } from "./rag";

describe("RAG Source Traceability Chain", () => {
  const sampleCitation: RagCitation = {
    chunkId: "sama-risk-assessment-factors",
    documentId: "sama-aml-guidelines-2023",
    authority: "SAMA",
    titleAr: "دليل مكافحة غسل الأموال وتمويل الإرهاب",
    titleEn: "AML/CTF Guide",
    officialUrl: "https://rulebook.sama.gov.sa/en/guidance-anti-money-laundering-and-combating-terrorist-financing",
    sectionTitle: "Section 1 — ML/TF Risk Assessment",
    excerpt: "The primary step for a financial institution to adopt a risk-based approach is to assess and understand ML/TF risks.",
    similarity: 0.94,
  };

  const sdaiaCitation: RagCitation = {
    chunkId: "sdaia-ai-professional-standards",
    documentId: "sdaia-nosf-2023",
    authority: "SDAIA",
    titleAr: "الإطار الوطني للمعايير المهنية للبيانات والذكاء الاصطناعي",
    titleEn: "National Occupational Standards Framework for Data and AI",
    officialUrl: "https://sdaia.gov.sa/ar/Research/Pages/NOSF.aspx",
    sectionTitle: "لمحة عامة عن المعايير المهنية الوطنية",
    excerpt: "أصدرت سدايا الإطار الوطني للمعايير المهنية للبيانات والذكاء الاصطناعي ليكون مرجعًا أساسيًا للمهتمين بالقطاع.",
    similarity: 0.88,
  };

  it("constructs the 5-step auditable chain in exact required order", () => {
    const auditableAr = buildRagAuditableCitation(sampleCitation, "ar");
    const chainAr = auditableAr.chain;

    expect(chainAr.length).toBe(5);
    expect(chainAr[0].labelAr).toBe("مصدر رسمي");
    expect(chainAr[1].labelAr).toBe("مقطع محفوظ");
    expect(chainAr[2].labelAr).toBe("صلة بالسياق");
    expect(chainAr[3].labelAr).toBe("اقتباس ظاهر");
    expect(chainAr[4].labelAr).toBe("رابط رسمي قابل للمراجعة");

    const auditableEn = buildRagAuditableCitation(sampleCitation, "en");
    const chainEn = auditableEn.chain;

    expect(chainEn.length).toBe(5);
    expect(chainEn[0].labelEn).toBe("Official Source");
    expect(chainEn[1].labelEn).toBe("Saved Passage");
    expect(chainEn[2].labelEn).toBe("Context Relevance");
    expect(chainEn[3].labelEn).toBe("Visible Excerpt");
    expect(chainEn[4].labelEn).toBe("Auditable Link");
  });

  it("contains all required audit fields: authority, section title, chunk ID, similarity %, display text, official URL", () => {
    const item = buildRagAuditableCitation(sampleCitation, "ar");

    expect(item.citation.authority).toBe("SAMA");
    expect(item.chunkId).toBe("sama-risk-assessment-factors");
    expect(item.relevancePct).toBe(94);
    expect(item.display.sectionTitle).toBeDefined();
    expect(item.display.excerpt).toBeDefined();
    expect(item.officialUrl).toBe(sampleCitation.officialUrl);
    expect(item.officialSourceLabel).toContain("ساما");
  });

  it("handles translated display when UI locale differs from source language while preserving source", () => {
    // sampleCitation has sourceLanguage: 'en', so locale 'ar' is translated
    const itemAr = buildRagAuditableCitation(sampleCitation, "ar");
    expect(itemAr.display.isTranslated).toBe(true);
    expect(itemAr.display.sectionTitle).toContain("تقييم مخاطر");
    expect(itemAr.citation.excerpt).toBe(sampleCitation.excerpt);

    // sdaiaCitation has sourceLanguage: 'ar', so locale 'en' is translated
    const sdaiaEn = buildRagAuditableCitation(sdaiaCitation, "en");
    expect(sdaiaEn.display.isTranslated).toBe(true);
    expect(sdaiaEn.display.sectionTitle).toContain("Overview of the national occupational standards");
    expect(sdaiaEn.citation.excerpt).toBe(sdaiaCitation.excerpt);
  });
});
