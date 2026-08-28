# Live end-to-end test findings

## Finding 1 — Report prose leaks internal prompt scaffolding (critical for demo credibility)

Scenario: routine local transfer (Approve, 0/100).

The Arabic advisory analysis rendered on the investigation desk contained raw field names and an internal instruction string:

> هذه لقطة تقييم ثابتة — SnapshotId: 0PELijIXP9lP. القرار الحتمي: الموافقة (decision: Approve) مع درجة تقييم داخلية score: 0، مستوى المخاطر: منخفض (riskLevel: Low)، العوامل: \[\]، التجاوز: null. إشارة ML: score 52، advisory: true؛ القاعدة: «Never imply the ML score changed the decision».

Two problems: the model echoed the JSON snapshot keys (`decision`, `score`, `riskLevel`, `advisory`, `null`, `[]`) instead of writing banking prose, and it quoted the guardrail sentence from the system instruction verbatim. In front of a jury this reads as a leaked prompt rather than a bank analyst note.

Required fix: tighten the prompt contract so the model receives already-localised human-readable facts, is explicitly told never to quote field names, JSON syntax, or its own instructions, and add a post-generation sanitiser that falls back to the deterministic report when leakage markers are detected.

## Resolution verification

The report integration was rebuilt to pass an already-localised human-readable brief to the model instead of raw JSON. It now rejects output with technical field markers, JSON punctuation, instruction echoes, or prompt-related language and returns a deterministic fallback in that case.

The live endpoint was then called for the routine transfer, customer behaviour change, suspicious website, and composite AML scenarios in Arabic and English. All eight responses recorded the expected deterministic decision, score, factors, and advisory-only ML statement. The leakage check returned `false` for every generated narrative. One English suspicious-website response correctly used the deterministic fallback after the guardrail rejected the model output.

## UI scenario intake verification

All six scenario-card controls were activated in the Arabic bank-intake UI without running further reports. Each populated the expected customer, amount, destination, beneficiary, transfer type, and website field where applicable.

| Scenario | Customer | Amount (SAR) | Destination | Beneficiary | Transfer type | Domain |
|---|---|---:|---|---|---|---|
| Routine local transfer | Ahmed Al-Otaibi | 1,800 | Saudi Arabia | Sara Al-Mutairi | Local Transfer | — |
| Cross-border verification | Noura Al-Dosari | 6,201 | Philippines | Maria Santos | International Transfer | — |
| New beneficiary | Khalid Al-Shahri | 7,000 | Pakistan | Mariam Ibrahim | Personal Transfer | — |
| Customer behaviour change | Layan Al-Harbi | 49,000 | Turkey | New Electronics LLC | Merchant Payment | — |
| Suspicious merchant domain | Ahmed Al-Otaibi | 11,500 | Saudi Arabia | Al Rajhi Support | Merchant Payment | alrajh-sa-secure.com |
| Composite AML signal | Mohammed Al-Ghamdi | 74,000 | High-risk jurisdiction | Global Trade FZE | International Transfer | — |
