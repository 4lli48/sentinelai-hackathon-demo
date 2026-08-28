import { describe, expect, it } from "vitest";
import type { InvokeResult } from "./_core/llm";
import { invokeGeminiWithFallback, invokeGeminiWithProviderFallback, llmErrorStatus, shouldTryNextGeminiModel } from "./geminiFallback";

const response = { choices: [{ message: { content: "usable response" } }] } as InvokeResult;
const silentLogger = { info: () => undefined, warn: () => undefined };

describe("Gemini model fallback", () => {
  it("uses the primary Gemini model when it succeeds", async () => {
    const calls: string[] = [];
    const result = await invokeGeminiWithFallback({ messages: [{ role: "user", content: "ping" }] }, {
      models: ["primary", "fallback"], logger: silentLogger,
      invoke: async params => { calls.push(params.model!); return response; },
    });
    expect(result.model).toBe("primary");
    expect(calls).toEqual(["primary"]);
    expect(result.attempts).toEqual([{ model: "primary", outcome: "success" }]);
  });

  it("moves to the next Gemini model after a 429", async () => {
    const calls: string[] = [];
    const result = await invokeGeminiWithFallback({ messages: [{ role: "user", content: "ping" }] }, {
      models: ["primary", "fallback"], logger: silentLogger,
      invoke: async params => {
        calls.push(params.model!);
        if (params.model === "primary") throw new Error("LLM invoke failed: 429 Too Many Requests");
        return response;
      },
    });
    expect(result.model).toBe("fallback");
    expect(calls).toEqual(["primary", "fallback"]);
    expect(result.attempts).toEqual([
      { model: "primary", status: 429, outcome: "fallback" },
      { model: "fallback", outcome: "success" },
    ]);
  });

  it("does not hide an invalid request behind another model", async () => {
    const calls: string[] = [];
    await expect(invokeGeminiWithFallback({ messages: [{ role: "user", content: "ping" }] }, {
      models: ["primary", "fallback"], logger: silentLogger,
      invoke: async params => { calls.push(params.model!); throw new Error("LLM invoke failed: 400 Bad Request"); },
    })).rejects.toThrow("400");
    expect(calls).toEqual(["primary"]);
  });

  it("reports exhaustion after all eligible Gemini models fail", async () => {
    const calls: string[] = [];
    await expect(invokeGeminiWithFallback({ messages: [{ role: "user", content: "ping" }] }, {
      models: ["primary", "fallback"], logger: silentLogger,
      invoke: async params => { calls.push(params.model!); throw new Error("LLM invoke failed: 429 Too Many Requests"); },
    })).rejects.toThrow("429");
    expect(calls).toEqual(["primary", "fallback"]);
  });

  it("classifies status errors without exposing response bodies", () => {
    expect(llmErrorStatus(new Error("LLM invoke failed: 429 Too Many Requests – details"))).toBe(429);
    expect(shouldTryNextGeminiModel(new Error("LLM invoke failed: 412 Precondition Failed"))).toBe(true);
    expect(shouldTryNextGeminiModel(new Error("LLM invoke failed: 401 Unauthorized"))).toBe(false);
  });
});

describe("Direct Gemini provider fallback", () => {
  it("uses a configured direct Gemini model after a failover-eligible managed error", async () => {
    const fetcher = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "direct reply" }] }, finishReason: "STOP" }] }), { status: 200, headers: { "content-type": "application/json" } });
    const result = await invokeGeminiWithProviderFallback({ messages: [{ role: "user", content: "Reply with one word." }] }, {
      invoke: async () => { throw new Error("HTTP 429 managed rate limit"); },
      models: ["managed-test"],
      directModels: ["direct-test"],
      apiKey: "test-key",
      fetcher: fetcher as typeof fetch,
      logger: silentLogger,
    });
    expect(result.provider).toBe("direct");
    expect(result.model).toBe("direct-test");
    expect(result.response.choices[0].message.content).toBe("direct reply");
  });
});
