import type { AnalysisResult } from "@shared/sentinel";

/** Keeps recent in-browser ordering while preferring a newer Supabase-backed report for the same decision. */
export function mergeDecisionResults(sessionResults: AnalysisResult[], persistedResults: AnalysisResult[]) {
  const merged = new Map<string, AnalysisResult>();
  sessionResults.forEach(result => merged.set(result.id, result));
  persistedResults.forEach(result => merged.set(result.id, result));
  return Array.from(merged.values());
}

/** Counts the unified durable history while retaining any new in-browser result before its query refreshes. */
export function decisionResultCount(sessionResults: AnalysisResult[], persistedResults: AnalysisResult[]) {
  return mergeDecisionResults(sessionResults, persistedResults).length;
}
