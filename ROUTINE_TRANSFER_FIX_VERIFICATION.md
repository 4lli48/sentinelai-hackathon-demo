# Routine Local Transfer Risk Fix Verification

## Root cause

The stored safe-transfer execution at `2026-08-23 11:31:37 UTC` showed a rule score of `0` and no rule factors, but the final composite result had escalated to `52 / Medium / Additional Verification`. Its frozen customer window had been parsed as `[09, 00]` from the text `09:00–18:00`; therefore the midday scenario was treated as outside usual hours. The resulting Isolation Forest advisory was `Elevated`, and the AI recommendation escalated the composite result.

## Applied safeguards

The profile parser now extracts the two hour values as `[09, 18]`. The AI prompt explicitly requires Low / Approve for a case with no material rule factors and a Routine signal, and composite policy rejects an AI escalation when both conditions hold. AI can still escalate when recorded rule factors or a non-routine behaviour signal support it.

## Live verification setup

The current transfer intake loaded the “Routine local transfer” scenario after the fix with Ahmed, 1,800 SAR, Saudi Arabia, Sara Al-Mutairi, and Local Transfer. The live analysis was submitted and produced a fresh record `KtzIgbkUfK2cpI`: rule assessment `Approve / 0`, AI recommendation `Approve / 15`, and composite outcome `Approve / Low / 15`. The decision page records zero deterministic factors, a known beneficiary and corridor, and an ordinary submission hour. Historic immutable records remain intact as audit history.
