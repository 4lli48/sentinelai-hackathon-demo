import { loadPersistedAnalysisResult } from "./sentinelSupabase";
import { createInvestigationReport } from "./sentinelAi";

async function main() {
  const persisted = await loadPersistedAnalysisResult("rJ2A9qtu5tGeYe");
  if (!persisted) throw new Error("Smoke-test operation is unavailable.");
  const report = await createInvestigationReport(persisted.result, "ar");
  console.log(JSON.stringify({
    source: report.source,
    ragStatus: report.rag?.status,
    citationCount: report.rag?.citations.length ?? 0,
    authorities: report.rag?.citations.map(citation => citation.authority) ?? [],
    decision: persisted.result.decision,
    score: persisted.result.score,
  }));
}

void main();
