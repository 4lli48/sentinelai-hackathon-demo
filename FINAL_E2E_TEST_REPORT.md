# SentinelAI Hackathon Demo — Final Practical Test Report

**Author:** SentinelAI Engineering Team  
**Scope:** Independent hackathon build. Focused on deterministic policy engine, isolation forest behaviour signals, and explainable audit trail.

## Executive conclusion

The demo is **functionally sufficient for a hackathon presentation**. Its central claim is operating as designed: an inspectable deterministic policy engine owns the outcome, while Isolation Forest and the AI analysis narrative remain explicitly advisory. The six scenarios cover the positive path, verification path, temporary hold, mandatory website override, and a critical composite AML case. The two material presentation defects found during testing—a raw-prompt leak in generated prose and an untranslated Turkey label in Arabic—were corrected and revalidated.

> **Recommendation:** Do not expand the decision logic before the event. Rehearse the six-scenario narrative and keep the current scope. Extra production integrations, real customer data, or a more complex predictive model would increase risk without improving the jury demonstration.

## A. Deterministic decision-engine results

The rule engine was executed against all six demo inputs. With the fixed reference time now embedded in each demo scenario, each replay produces the same decision score and advisory ML score while creating a fresh decision snapshot identifier.

| Scenario | Policy score | Risk | Final deterministic decision | Rule factors | Alert / case | Result |
|---|---:|---|---|---|---|---|
| Routine local transfer | 0/100 | Low | Approve | None | No / not required | Pass |
| Cross-border verification | 35/100 | Medium | Additional Verification | International threshold | No / open | Pass |
| New beneficiary | 65/100 | High | Temporary Hold | Amount deviation, new beneficiary, behaviour, composition | High / open | Pass |
| Customer behaviour change | 65/100 | High | Temporary Hold | Amount deviation, new beneficiary, behaviour, composition | High / open | Pass |
| Suspicious merchant domain | 80/100 | High | Manual Review | New beneficiary, website signals, behaviour, composition, mandatory override | High / open | Pass |
| Composite AML signal | 100/100 | Critical | Manual Review | Prior risk, amount, high-risk corridor, international threshold, new beneficiary, behaviour, composition | Critical / open | Pass |

The high-risk website override was separately tested with a low-value payment. It forced **Manual Review** at a 35/100 policy score, confirming that mandatory policy can override the score and cannot be bypassed by ML or AI. Boundary tests also confirmed that the international policy threshold activates at 5,001 SAR but not at 5,000 SAR; the trusted-domain reference remains an approval with no added risk.

## B. Reproducibility, auditability, and localisation

Each of the six scenarios was replayed three times through the deterministic engine. Scores, decisions, and ML signal scores remained stable; only the snapshot identifier changed, as intended. Every result contains all 14 audit stages, including context freezing, rule-engine decision, case handling, and the explainable artifact stage. Arabic titles and Arabic evidence were present for every activated factor.

All six scenarios were then run once through the live Arabic intake flow, from `/bank` to `/analysis`, in one clean local demo session. The resulting session recorded six assessed transfers, **five open cases**—all outcomes except the routine approval—and **four formal alerts**—the two temporary holds and two manual reviews. The additional-verification scenario opened a case without creating an alert, exactly as intended. The customer-behaviour scenario correctly loaded **ليان الحربي**, **49,000 SAR**, **Turkey**, and **New Electronics LLC**; the Arabic cases register now renders the destination as **تركيا**.

## C. AI advisory report verification and correction

The advisory report generator connects to the configured **AI Reasoning Engine**. A fresh live run for the customer-behaviour scenario rendered a clearly labelled **تقرير الذكاء الاصطناعي الاستشاري** section in the investigation desk, with visible source **AI System**. The report was tied to Layan’s frozen decision snapshot, stated the 65/100 temporary hold and its four deterministic factors, and contained no leakage markers. When a user changes language after a report has been generated, the product intentionally uses a local deterministic translation rather than silently claiming that AI produced a new report; the UI now labels that state **Deterministic safety report** or **التقرير الحتمي الآمن**.

## D. Quality gates completed

| Gate | Result |
|---|---|
| TypeScript type check | Pass |
| Vitest suite | Pass — 18 tests across 4 files |
| Deterministic replay check | Pass — 6/6 scenarios stable |
| 14-stage audit completeness | Pass — 6/6 scenarios |
| Arabic factor and evidence completeness | Pass — 6/6 scenarios |
| Arabic live end-to-end intake and decision flow | Pass — 6/6 scenarios in one clean session |
| Cases and alerts after the six-run session | Pass — 5 open cases and 4 alerts, matching policy outcomes |
| AI advisory report | Pass — visible for the new behaviour case; source, snapshot grounding, and no-leakage check verified |
| Arabic and English decision / investigation views | Pass — RTL/LTR copy, factors, decisions, and transparent fallback source verified |
| Turkey localisation in Arabic | Pass — displayed as تركيا in the case register |
| Browser-console errors during test | None observed |

## E. Fit for the hackathon

The demo now communicates a credible and bounded story: it is not a black-box fraud predictor and it does not claim to be a production compliance platform. It demonstrates an auditable workflow from intake to decision, evidence, human-review case, and AI-assisted explanation. This is exactly the right trade-off for the event: clear enough to understand quickly, substantive enough to defend during technical questions, and isolated from real systems.

## F. Optional improvements after the presentation

No addition is required before the hackathon. If time remains after rehearsal, the highest-value non-essential improvements are limited to the following:

| Priority | Optional addition | Why it helps | Why it is not required now |
|---|---|---|---|
| 1 | A visible “Start fresh demo session” control | Clears locally stored test cases before a jury walkthrough | Current session state is already local and harmless |
| 2 | A one-click presentation sequence | Opens the recommended scenarios in an agreed order | The six cards and demo guide already support a clear walkthrough |
| 3 | A printable one-page decision artifact | Lets judges take away a static example of evidence and rationale | It adds packaging, not core decision value |

Avoid adding live bank APIs, real customer histories, regulatory claims, supervised model training, payment execution, or persistent case management at this stage. They would contradict the controlled hackathon scope and introduce failure modes that are unnecessary for the demonstration.
