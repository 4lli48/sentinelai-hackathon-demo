# Regulatory Grounding for AI Advisory Reports

**Scope.** This document records how SentinelAI uses selected public regulatory and governance materials in its transaction risk review. The materials provide **curated explanatory context only**. They do not train the underlying model, create a legal conclusion, certify compliance, or change a decision.

> The deterministic fourteen-stage rule engine remains the sole decision authority. The AI reasoning engine may describe the evidence in a frozen snapshot, while the displayed reference cards help a reviewer understand the wider monitoring and AI-governance context.

## Curated reference catalogue

| Authority | Official material | Role inside SentinelAI | Explicit limitation |
|---|---|---|---|
| ساما / SAMA | AML/CTF Guide | Context for customer-risk assessment, due diligence, transaction monitoring, and suspicious-transaction handling [1] | It is not asserted to require the demo’s specific score, alert, or action. |
| FATF | Risk-Based Approach Guidance | Context for a proportionate, risk-based review of the recorded signals [2] | It does not replace national requirements or constitute a legal conclusion. |
| سدايا / SDAIA | AI Ethics Assessment | Context for keeping the AI narrative advisory, reviewable, and separate from the deterministic outcome [3] | It is not a certification of the model or the product. |

## Implementation controls

The catalogue is a fixed, typed application asset. Each case receives only the permitted cards, selected from the factors present in its frozen decision snapshot. The application displays the official source links separately from the AI prose so users can open and inspect the underlying materials themselves.

The AI reasoning engine receives a constrained, human-readable case brief rather than a raw record. Its prompt prohibits citations, authority names, URLs, regulatory conclusions, and claims that an authority mandates the outcome. A server-side filter removes any sentence that names one of the permitted authorities in generated prose, replacing it with a neutral statement that the curated context supports a proportionate review but does not set the outcome. For short model output, SentinelAI retains only the completed leading sentences—two in English and one in Arabic—then appends a clearly labelled deterministic safety completion that names the remaining decision factors and preserves the advisory boundary.

## Verification record

Live English and Arabic case flows were run using the high-risk customer-behaviour scenario. The investigation page showed the AI advisory panel, its source state, the deterministic-completion disclosure where needed, and the three reference cards. The final English and Arabic renders contained completed prose, no duplicated punctuation, no unfinished trailing phrase, and no regulatory mandate claim. The automated suite covers the catalogue, bilingual authority names, prompt-leak detection, unsupported regulatory-command removal, short-output cleanup, deterministic completion, and the invariant that the decision source remains the rule engine.

## References

[1]: https://rulebook.sama.gov.sa/en/guidance-anti-money-laundering-and-combating-terrorist-financing "SAMA AML/CTF Guide"
[2]: https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatfguidanceontherisk-basedapproachtocombatingmoneylaunderingandterroristfinancing-highlevelprinciplesandprocedures.html "FATF Risk-Based Approach Guidance"
[3]: https://dgp.sdaia.gov.sa/wps/portal/pdp/services/servicesdetails/AIEthicsAssessment/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8ziPR1dzTwMgw2MDMOcTA3MjH39TE29jY0MnI30w9EUhIZZAhUEGvl6OXoaGwQY60cRo98AB3A0IKTfi5ACoA-MinydfdP1owoSSzJ0M_PS8vUjHD1dSzIyk4sdi4tTi4tzU_NKgC6JwmuWhRGGAkzPghXg8U1wYpF-QW5oRJVPWrCnrqMiAAIPg5Q!/dz/d5/L0lHSkovd0RNQU5rQUVnQSEhLzROVkUvZW4!/ "SDAIA AI Ethics Assessment"
