import { describe, expect, it } from "vitest";

describe("Google Gemini API key", () => {
  it("can list the available Gemini models with the configured server secret", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey, "GEMINI_API_KEY must be configured for direct Gemini fallback").toBeTruthy();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey!)}`, {
      signal: AbortSignal.timeout(12_000),
    });
    expect(response.status, `Gemini model catalog returned HTTP ${response.status}`).toBe(200);
    const payload = await response.json() as { models?: Array<{ name?: string }> };
    expect(payload.models?.some(model => model.name?.startsWith("models/gemini-"))).toBe(true);
  }, 15_000);
});
