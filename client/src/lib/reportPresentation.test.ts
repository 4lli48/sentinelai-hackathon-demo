import { describe, expect, it } from "vitest";
import { reportPresentationLabels } from "./reportPresentation";

describe("white-label report presentation", () => {
  it("uses an Arabic AI label without exposing a provider name", () => {
    const labels = reportPresentationLabels(true, true, "ar");
    expect(labels.title).toBe("تقرير الذكاء الاصطناعي");
    expect(labels.source).toBe("نظام الذكاء الاصطناعي · إكمال حماية حتمي");
    expect(`${labels.title} ${labels.source}`).not.toMatch(/gemini/i);
  });

  it("uses an English AI label without exposing a provider name", () => {
    const labels = reportPresentationLabels(true, false, "en");
    expect(labels.title).toBe("AI analysis report");
    expect(labels.source).toBe("AI system");
    expect(`${labels.title} ${labels.source}`).not.toMatch(/gemini/i);
  });
});
