import { describe, expect, it } from "vitest";
import { canRetryReport, latestRetryableQuestion, MAX_AI_RETRY_ATTEMPTS, retriesRemaining } from "./investigationRetry";

describe("investigation retry helpers", () => {
  it("allows report retry only while no live response is available and no request is pending", () => {
    expect(canRetryReport("Deterministic fallback", false)).toBe(true);
    expect(canRetryReport("Gemini AI", false)).toBe(false);
    expect(canRetryReport("Local AI", false)).toBe(false);
    expect(canRetryReport("Deterministic fallback", true)).toBe(false);
    expect(canRetryReport("Deterministic fallback", false, MAX_AI_RETRY_ATTEMPTS)).toBe(false);
    expect(retriesRemaining(0)).toBe(3);
    expect(retriesRemaining(10)).toBe(0);
  });

  it("reuses the latest user question only after a deterministic fallback", () => {
    const failed = [
      { role: "user" as const, content: "What should be reviewed?" },
      { role: "assistant" as const, content: "Unavailable", source: "Deterministic fallback" as const },
    ];
    expect(latestRetryableQuestion(failed)).toBe("What should be reviewed?");
    expect(latestRetryableQuestion([{ role: "user", content: "Still drafting" }])).toBeNull();
  });
});
