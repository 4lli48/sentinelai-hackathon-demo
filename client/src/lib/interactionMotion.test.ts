import { describe, expect, it } from "vitest";
import { caseFilterDelay, shouldCelebrateAiRefresh } from "./interactionMotion";

describe("interaction motion helpers", () => {
  it("keeps case entry delays short and bounded", () => {
    expect(caseFilterDelay(0)).toBe(0);
    expect(caseFilterDelay(3)).toBe(102);
    expect(caseFilterDelay(20)).toBe(272);
  });

  it("celebrates only a successful live AI refresh", () => {
    expect(shouldCelebrateAiRefresh("Gemini AI")).toBe(true);
    expect(shouldCelebrateAiRefresh("Deterministic fallback")).toBe(false);
    expect(shouldCelebrateAiRefresh(undefined)).toBe(false);
  });
});
