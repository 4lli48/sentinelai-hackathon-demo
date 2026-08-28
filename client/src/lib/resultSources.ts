import type { AnalysisResult } from "@shared/sentinel";
import { mergeDecisionResults } from "./persistentResults";

/** Separates durable Supabase history from browser-only results awaiting a query refresh. */
export function summarizeResultSources(sessionResults: AnalysisResult[], persistedResults: AnalysisResult[]) {
  const persistedIds = new Set(persistedResults.map(result => result.id));
  const sessionOnly = sessionResults.filter(result => !persistedIds.has(result.id));
  return {
    persisted: persistedResults.length,
    sessionOnly: sessionOnly.length,
    unified: mergeDecisionResults(sessionResults, persistedResults),
  };
}
