export type RetryMessage = {
  role: "user" | "assistant";
  content: string;
  source?: "Gemini AI" | "Local AI" | "Deterministic fallback" | "Scope guard";
};

export const MAX_AI_RETRY_ATTEMPTS = 3;

export function retriesRemaining(retriesUsed: number) {
  return Math.max(0, MAX_AI_RETRY_ATTEMPTS - retriesUsed);
}

export function canRetryReport(source: string | undefined, isPending: boolean, retriesUsed = 0) {
  return !isPending && source !== "Gemini AI" && source !== "Local AI" && retriesRemaining(retriesUsed) > 0;
}

export function latestRetryableQuestion(messages: RetryMessage[]) {
  const latest = messages.at(-1);
  if (!latest || latest.role !== "assistant" || latest.source !== "Deterministic fallback") return null;
  return [...messages].reverse().find(message => message.role === "user")?.content ?? null;
}
