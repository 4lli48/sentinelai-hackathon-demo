const endpoint = "http://127.0.0.1:3000/api/trpc/sentinel.analyze?batch=1";

const scenarios = [
  ["safe", { customerId: "ahmed", amount: 1800, currency: "SAR", destinationCountry: "Saudi Arabia", beneficiaryName: "Sara Al-Mutairi", transactionType: "Local Transfer", submittedAt: "2026-08-13T12:00:00.000Z", locale: "en" }],
  ["verify", { customerId: "noura", amount: 12000, currency: "SAR", destinationCountry: "Philippines", beneficiaryName: "Maria Santos", transactionType: "International Transfer", submittedAt: "2026-08-13T12:00:00.000Z", locale: "en" }],
  ["website", { customerId: "ahmed", amount: 3200, currency: "SAR", destinationCountry: "Saudi Arabia", beneficiaryName: "Sara Al-Mutairi", transactionType: "Merchant Payment", websiteDomain: "alrajh-sa-secure.com", submittedAt: "2026-08-13T12:00:00.000Z", locale: "ar" }],
  ["laundering", { customerId: "mohammed", amount: 74000, currency: "SAR", destinationCountry: "High-risk jurisdiction", beneficiaryName: "Global Trade FZE", transactionType: "International Transfer", submittedAt: "2026-08-13T12:00:00.000Z", locale: "ar" }],
];

function resultOf(payload) {
  return payload?.[0]?.result?.data?.json ?? payload?.result?.data?.json ?? null;
}

const results = [];
for (const [id, input] of scenarios) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ 0: { json: input } }),
  });
  const payload = await response.json();
  const result = resultOf(payload);
  if (!response.ok || !result) throw new Error(`Scenario ${id} failed with HTTP ${response.status}`);
  results.push({
    scenario: id,
    locale: input.locale,
    transaction_id: result.id,
    decision: result.decision,
    risk_level: result.riskLevel,
    score: result.score,
    factor_count: result.factors?.length ?? 0,
    report_source: result.report?.source ?? "missing",
    snapshot_id: result.snapshot?.snapshotId ?? "missing",
  });
}

console.log(JSON.stringify(results, null, 2));
