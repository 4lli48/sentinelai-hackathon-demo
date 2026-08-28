# Operational Proof — Engine and AI Per Transaction

**Test date:** 13 August 2026  
**Execution path:** `sentinel.analyze` tRPC mutation on the local running server.  
**Method:** For every demo scenario, the test first executed `runDeterministicAnalysis` directly, then sent the same transaction to the live API. It compared the score, decision, risk level, and exact factor identifiers. The live route then invoked `createInvestigationReport` for that transaction.

> This is a real execution proof, not a UI check. The decision path is **transaction input → deterministic engine → frozen snapshot → live AI report**.

## Evidence of live execution

| Scenario | Live policy score | Engine decision | Triggered deterministic factors | Snapshot | AI report result |
|---|---:|---|---|---|---|
| Routine local transfer | 0/100 | Approve | None | Unique | AI report, deterministic completion |
| Cross-border verification | 35/100 | Additional Verification | International threshold | Unique | AI report, deterministic completion |
| New beneficiary | 65/100 | Temporary Hold | Amount deviation; new beneficiary; behaviour; multi-signal | Unique | AI report, deterministic completion |
| Customer behaviour change | 65/100 | Temporary Hold | Amount deviation; new beneficiary; behaviour; multi-signal | Unique | AI report, model completion |
| Suspicious merchant domain | 80/100 | Manual Review | New beneficiary; high-risk website; behaviour; multi-signal; website override | Unique | AI report, deterministic completion |
| Composite AML signal | 100/100 | Manual Review | Prior risk; amount deviation; high-risk corridor; international threshold; new beneficiary; behaviour; multi-signal | Unique | AI report, deterministic completion |

## Assertions that passed

The operational script verified all of the following for **6/6** transactions:

1. The live API score, decision, risk level, and factor IDs exactly matched a separately executed deterministic engine run.
2. Every response created a different frozen snapshot ID.
3. Every report included non-empty analysis, evidence, recommended actions, and curated official-context references.
4. Every activated deterministic factor had matching evidence in its own report; no report reused a factor list from another transaction.
5. The AI report source was returned for every live call. A deterministic completion is a visible safety finish for a short model output; it does **not** change the engine decision or claim that AI made it.

## Boundary of responsibility

| Component | Does it execute? | Does it decide? | Can it override the outcome? |
|---|---|---|---|
| Deterministic rule engine | Yes, per submitted transaction | Yes | Yes, through explicit policy rules only |
| Isolation Forest signal | Yes, per submitted transaction | No | No |
| AI investigation report | Yes, after the frozen decision snapshot | No | No |

The UI renders the returned result. It does not calculate or fabricate the score, factors, decision, snapshot, or report itself.
