import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("بطاقة عوامل القرار", () => {
  const stylesheet = readFileSync(new URL("./index.css", import.meta.url), "utf8");
  const analysisSource = readFileSync(new URL("./pages/Analysis.tsx", import.meta.url), "utf8");
  const auditStyles = readFileSync(new URL("./deep-audit.css", import.meta.url), "utf8");

  it("تمنع تمدد البطاقة إلى ارتفاع عمود تحليل الذكاء المجاور", () => {
    expect(stylesheet).toContain(".analysis-grid { align-items:start; }");
    expect(stylesheet).toContain(".factor-panel { align-self:start; height:auto; min-height:0; }");
    expect(stylesheet).toContain(".factor-list { min-height:0; }");
  });

  it("يعرض حالة تحميل صريحة قبل إظهار حالة عدم وجود عملية", () => {
    expect(analysisSource).toContain("persistedResults.isLoading && results.length === 0");
    expect(analysisSource).toContain("Loading stored decisions");
    expect(auditStyles).toContain(".analysis-loading-state");
  });
});
