import { createInvestigationReport } from "./sentinelAi";
import { persistRagGrounding } from "./sentinelRag";
import { loadPersistedAnalysisResult, refreshPersistedInvestigationReport } from "./sentinelSupabase";

async function main() {
  const transactionId = "rJ2A9qtu5tGeYe";
  const persisted = await loadPersistedAnalysisResult(transactionId);
  if (!persisted) throw new Error("Integration-test operation is unavailable.");
  const before = { decision: persisted.result.decision, score: persisted.result.score };
  const report = await createInvestigationReport(persisted.result, "ar");
  const refreshed = await refreshPersistedInvestigationReport(transactionId, report);
  if (!refreshed) throw new Error("Stored report refresh did not return a result.");
  await persistRagGrounding(transactionId, refreshed.snapshot.snapshotId, report.rag!);
  if (refreshed.decision !== before.decision || refreshed.score !== before.score) throw new Error("RAG must not change the deterministic decision.");
  console.log(JSON.stringify({ decision: refreshed.decision, score: refreshed.score, ragStatus: report.rag?.status, citations: report.rag?.citations.length ?? 0 }));
}

void main();
