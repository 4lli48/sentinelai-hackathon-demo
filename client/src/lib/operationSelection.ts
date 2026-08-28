import type { AnalysisResult } from "@shared/sentinel";

export function operationForId(results: AnalysisResult[], id: string | null) {
  return id ? results.find(result => result.id === id) : undefined;
}

export function operationQuery(id: string) {
  return `?id=${encodeURIComponent(id)}`;
}
