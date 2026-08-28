import type { InvokeParams, InvokeResult } from "./_core/llm";
import { invokeGeminiWithProviderFallback } from "./geminiFallback";

export type SentinelAiSource = "Local AI" | "Gemini AI";

type FetchLike = typeof fetch;
type LocalModelOptions = {
  model?: string;
  url?: string;
  fetcher?: FetchLike;
};

function textContent(content: InvokeParams["messages"][number]["content"]) {
  if (typeof content === "string") return content;
  const items = Array.isArray(content) ? content : [content];
  return items
    .filter((item): item is { type: "text"; text: string } => typeof item === "object" && item !== null && "type" in item && item.type === "text")
    .map(item => item.text)
    .join("\n");
}

function localResponseFormat(params: InvokeParams) {
  const responseFormat = params.response_format as { type?: string; json_schema?: { schema?: unknown } } | undefined;
  if (responseFormat?.type === "json_schema") return responseFormat.json_schema?.schema ?? "json";
  if (responseFormat?.type === "json_object") return "json";
  return undefined;
}

/** Invokes Ollama on the same machine. No transaction data leaves the local device. */
export async function invokeLocalOllama(params: InvokeParams, options: LocalModelOptions = {}): Promise<InvokeResult> {
  const model = options.model ?? (process.env.LOCAL_AI_MODEL?.trim() || "qwen3:1.7b");
  const url = options.url ?? (process.env.LOCAL_AI_URL?.trim() || "http://127.0.0.1:11434/api/chat");
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: params.messages.map(message => ({ role: message.role, content: textContent(message.content) })),
      options: {
        temperature: 0.2,
        num_predict: Math.max(params.maxTokens ?? params.max_tokens ?? 800, 1024),
      },
      ...(localResponseFormat(params) ? { format: localResponseFormat(params) } : {}),
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} Local Ollama request failed`);
  const payload = await response.json() as { message?: { content?: string; thinking?: string }; model?: string; prompt_eval_count?: number; eval_count?: number };
  let content = payload.message?.content?.trim();
  if (!content && payload.message?.thinking) {
    // If output ended up in thinking or content was empty after thinking
    content = payload.message.thinking.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  }
  if (!content) throw new Error("Local Ollama response contained no text content");
  return {
    id: `local-${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    model: payload.model ?? model,
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: payload.prompt_eval_count ?? 0, completion_tokens: payload.eval_count ?? 0, total_tokens: (payload.prompt_eval_count ?? 0) + (payload.eval_count ?? 0) },
  } as InvokeResult;
}

/**
 * Local is an explicit mode: it never silently falls through to Gemini.
 * Select Gemini only by setting SENTINEL_AI_PROVIDER=gemini during development.
 */
export async function invokeSentinelAi(params: InvokeParams): Promise<{ response: InvokeResult; source: SentinelAiSource }> {
  if (process.env.SENTINEL_AI_PROVIDER?.trim().toLowerCase() === "local") {
    return { response: await invokeLocalOllama(params), source: "Local AI" };
  }
  const { response } = await invokeGeminiWithProviderFallback(params);
  return { response, source: "Gemini AI" };
}
