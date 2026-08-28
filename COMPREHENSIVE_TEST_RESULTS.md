# Comprehensive Acceptance Results

## Automated decision matrix

`pnpm check && pnpm test` completed successfully: **12/12 tests passed**.

| Scenario | Expected deterministic decision | Result |
|---|---|---|
| Routine local transfer | Approve | Pass |
| Cross-border verification | Additional Verification | Pass |
| New beneficiary | Temporary Hold | Pass |
| Customer behaviour change | Temporary Hold | Pass |
| Suspicious merchant domain | Manual Review | Pass |
| Composite AML signal | Manual Review | Pass |

## Live behaviour-change flow

The sixth scenario was selected through bank intake, populated Layan Al-Harbi, 49,000 SAR, Turkey, and New Electronics LLC, then completed the full live flow.

| Check | Result |
|---|---|
| Deterministic score and decision | 65/100, High, Temporary Hold |
| Triggered factors | Amount deviation +20, new beneficiary +15, behaviour deviation +20, multi-signal escalation +10 |
| ML signal | 64/100, Elevated, explicitly advisory |
| Report source | SentinelAI Risk Intelligence LLM, grounded in the decision snapshot |
| Case and alert | Open review case and High alert shown consistently |
| Investigation | Evidence, advisory analysis, references, actions, and non-persistent simulation all available |

## UI and route coverage

The dashboard, bank intake, decision review, investigation desk, cases and alerts, and governance pages were captured after the update. Fresh-session decision, investigation, and case pages correctly show their intentional empty states until an analysis is run. The live session verified that populated states render on analysis, investigation, and cases screens.
