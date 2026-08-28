import { demoScenarios } from "../shared/sentinel.ts";
import { runDeterministicAnalysis } from "../server/sentinelEngine.ts";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const locale = process.env.LOCALE ?? "en";
const observed = [];
const snapshotIds = new Set();

for (const scenario of demoScenarios) {
  const engine = runDeterministicAnalysis(scenario.input);
  const response = await fetch(`${BASE_URL}/api/trpc/sentinel.analyze?batch=1`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ 0: { json: { ...scenario.input, locale } } }),
  });
  const raw = await response.json();
  const live = raw?.[0]?.result?.data?.json;
  if (!live) throw new Error(`${scenario.id}: live analysis returned no payload`);
  const sameDecision = engine.decision === live.decision && engine.score === live.score && engine.riskLevel === live.riskLevel;
  const sameFactors = engine.factors.map(item => item.id).join("|") === live.factors.map(item => item.id).join("|");
  const reportComplete = Boolean(live.report?.analysis?.trim()) && live.report?.evidence?.length > 0 && live.report?.actions?.length > 0;
  const evidenceBound = live.factors.every(factor => live.report.evidence.some(item => item.includes(factor.evidence) || item.includes(factor.evidenceAr) || item.includes(factor.title) || item.includes(factor.titleAr)));
  const uniqueSnapshot = Boolean(live.snapshot?.snapshotId) && !snapshotIds.has(live.snapshot.snapshotId);
  snapshotIds.add(live.snapshot.snapshotId);
  const hasOfficialContext = live.report?.references?.length >= 1;
  if (!sameDecision || !sameFactors || !reportComplete || !evidenceBound || !uniqueSnapshot || !hasOfficialContext) {
    throw new Error(`${scenario.id}: proof failed ${JSON.stringify({ sameDecision, sameFactors, reportComplete, evidenceBound, uniqueSnapshot, hasOfficialContext })}`);
  }
  observed.push({
    scenario: scenario.id,
    score: live.score,
    decision: live.decision,
    factors: live.factors.map(item => item.id),
    snapshotId: live.snapshot.snapshotId,
    reportSource: live.report.source,
    reportCompletion: live.report.completion ?? "model",
    reportWords: live.report.analysis.trim().split(/\s+/).length,
  });
}

console.log(JSON.stringify({ status: "pass", locale, scenarios: observed, sourceCounts: observed.reduce((counts, item) => ({ ...counts, [item.reportSource]: (counts[item.reportSource] ?? 0) + 1 }), {}) }, null, 2));
