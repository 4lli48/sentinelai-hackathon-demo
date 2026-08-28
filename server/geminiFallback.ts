import { invokeLLM, type InvokeParams, type InvokeResult } from "./_core/llm";

/**
 * The live model catalog currently exposes these Gemini IDs. The chain is
 * intentionally provider-consistent: each model receives the same request.
 */
export const GEMINI_MODEL_CHAIN = ["gemini-3-flash-preview", "gemini-3.1-pro-preview"] as const;
export const DIRECT_GEMINI_MODEL_CHAIN = ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite"] as const;

type LlmInvoker = (params: InvokeParams) => Promise<InvokeResult>;
type SafeLogger = Pick<Console, "info" | "warn">;

export type GeminiAttempt = {
  model: string;
  status?: number;
  outcome: "success" | "fallback" | "terminal";
};

export type GeminiFallbackResult = {
  response: InvokeResult;
  model: string;
  attempts: GeminiAttempt[];
  provider: "managed" | "direct";
};

export type GeminiFallbackOptions = {
  models?: readonly string[];
  invoke?: LlmInvoker;
  logger?: SafeLogger;
};

type FetchLike = typeof fetch;
export type GeminiProviderFallbackOptions = GeminiFallbackOptions & {
  directModels?: readonly string[];
  fetcher?: FetchLike;
  apiKey?: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function llmErrorStatus(error: unknown) {
  const match = errorMessage(error).match(/(?:status\s*|HTTP\s*|failed:\s*)(\d{3})\b/i);
  return match ? Number(match[1]) : undefined;
}

/** Only failures where a different model may help are eligible for failover. */
export function shouldTryNextGeminiModel(error: unknown) {
  const status = llmErrorStatus(error);
  if (status !== undefined) return [404, 408, 412, 429, 500, 502, 503, 504].includes(status);
  return /timeout|timed out|network|fetch failed|socket|ECONNRESET/i.test(errorMessage(error));
}

/**
 * Runs one unchanged request through the Gemini chain. It does not hide bad
 * prompts or programming failures behind another model. Callers own their
 * deterministic fallback when every eligible model has failed.
 */
export async function invokeGeminiWithFallback(params: InvokeParams, options: GeminiFallbackOptions = {}): Promise<GeminiFallbackResult> {
  const models = options.models ?? GEMINI_MODEL_CHAIN;
  const invoke = options.invoke ?? invokeLLM;
  const logger = options.logger ?? console;
  const attempts: GeminiAttempt[] = [];
  let lastError: unknown;

  for (let index = 0; index < models.length; index++) {
    const model = models[index];
    logger.info(`[SentinelAI Gemini] trying model ${index + 1}/${models.length}: ${model}`);
    try {
      const response = await invoke({ ...params, model });
      attempts.push({ model, outcome: "success" });
      logger.info(`[SentinelAI Gemini] model succeeded: ${model}`);
      return { response, model, attempts, provider: "managed" };
    } catch (error) {
      lastError = error;
      const status = llmErrorStatus(error);
      const canFailOver = shouldTryNextGeminiModel(error) && index < models.length - 1;
      attempts.push({ model, status, outcome: canFailOver ? "fallback" : "terminal" });
      if (!canFailOver) {
        logger.warn(`[SentinelAI Gemini] model ${model} failed${status ? ` (HTTP ${status})` : ""}; no further Gemini model will be tried.`);
        throw error;
      }
      logger.warn(`[SentinelAI Gemini] model ${model} unavailable${status ? ` (HTTP ${status})` : ""}; trying the next Gemini model.`);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No Gemini model could complete the request.");
}

function contentAsText(content: InvokeParams["messages"][number]["content"]) {
  if (typeof content === "string") return content;
  const items = Array.isArray(content) ? content : [content];
  return items.filter((item): item is { type: "text"; text: string } => typeof item === "object" && item !== null && "type" in item && item.type === "text").map(item => item.text).join("\n");
}

function directGeminiBody(params: InvokeParams) {
  const system = params.messages.filter(message => message.role === "system").map(message => contentAsText(message.content)).filter(Boolean).join("\n\n");
  const contents = params.messages.filter(message => message.role !== "system").map(message => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: contentAsText(message.content) }],
  }));
  return {
    ...(system ? { system_instruction: { parts: [{ text: system }] } } : {}),
    contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: params.maxTokens ?? params.max_tokens ?? 800,
      ...(params.response_format?.type === "json_schema" || params.response_format?.type === "json_object" ? { responseMimeType: "application/json" } : {}),
    },
  };
}

async function invokeDirectGemini(params: InvokeParams, model: string, apiKey: string, fetcher: FetchLike): Promise<InvokeResult> {
  const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(directGeminiBody(params)),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} Direct Gemini request failed`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } };
  const text = payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("\n").trim();
  if (!text) throw new Error("Direct Gemini response contained no text content");
  return {
    id: `direct-${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: payload.candidates?.[0]?.finishReason ?? null }],
    usage: payload.usageMetadata ? { prompt_tokens: payload.usageMetadata.promptTokenCount ?? 0, completion_tokens: payload.usageMetadata.candidatesTokenCount ?? 0, total_tokens: payload.usageMetadata.totalTokenCount ?? 0 } : undefined,
  };
}

async function invokeDirectGeminiWithFallback(params: InvokeParams, options: GeminiProviderFallbackOptions, attempts: GeminiAttempt[]): Promise<GeminiFallbackResult> {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Direct Gemini fallback is not configured.");
  const models = options.directModels ?? DIRECT_GEMINI_MODEL_CHAIN;
  const fetcher = options.fetcher ?? fetch;
  const logger = options.logger ?? console;
  let lastError: unknown;
  for (let index = 0; index < models.length; index++) {
    const model = models[index];
    logger.info(`[SentinelAI Gemini] trying direct model ${index + 1}/${models.length}: ${model}`);
    try {
      const response = await invokeDirectGemini(params, model, apiKey, fetcher);
      attempts.push({ model, outcome: "success" });
      logger.info(`[SentinelAI Gemini] direct model succeeded: ${model}`);
      return { response, model, attempts, provider: "direct" };
    } catch (error) {
      lastError = error;
      const status = llmErrorStatus(error);
      const canFailOver = shouldTryNextGeminiModel(error) && index < models.length - 1;
      attempts.push({ model, status, outcome: canFailOver ? "fallback" : "terminal" });
      logger.warn(`[SentinelAI Gemini] direct model ${model} failed${status ? ` (HTTP ${status})` : ""}${canFailOver ? "; trying the next direct model." : "; no direct model remains."}`);
      if (!canFailOver) throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No direct Gemini model could complete the request.");
}

/** Uses the managed Gemini chain first, then a configured direct Gemini key, before callers use deterministic fallback. */
export async function invokeGeminiWithProviderFallback(params: InvokeParams, options: GeminiProviderFallbackOptions = {}): Promise<GeminiFallbackResult> {
  try {
    return await invokeGeminiWithFallback(params, options);
  } catch (managedError) {
    if (!shouldTryNextGeminiModel(managedError) || !(options.apiKey ?? process.env.GEMINI_API_KEY)) throw managedError;
    const logger = options.logger ?? console;
    logger.warn("[SentinelAI Gemini] managed chain unavailable; trying configured direct Gemini models.");
    return invokeDirectGeminiWithFallback(params, options, []);
  }
}
