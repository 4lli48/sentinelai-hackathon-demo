import { describe, expect, it } from "vitest";
import { assistantQuestionReady, assistantReply } from "./investigationAssistant";

describe("investigation assistant", () => {
  it("is immediately available when a meaningful question is supplied", () => {
    expect(assistantQuestionReady("   ")).toBe(false);
    expect(assistantQuestionReady("What changed?")).toBe(true);
  });

  it("keeps the reply explicitly non-persistent and decision-bound", () => {
    const reply = assistantReply("SNAP-01", "Manual Review", "Manual Review", "en");
    expect(reply).toContain("Unsaved");
    expect(reply).toContain("SNAP-01");
    expect(reply).toContain("does not modify");
  });
});
