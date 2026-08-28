# Regulatory research notes — report grounding

## Official sources reviewed

| Authority | Official source | Verified scope for this demo |
|---|---|---|
| Saudi Central Bank (SAMA) | [AML/CTF Guide](https://rulebook.sama.gov.sa/en/guidance-anti-money-laundering-and-combating-terrorist-financing) | In-force guide issued by circular 18318/486 (17 November 2019). Its contents include ML/TF risk assessment, controls, due diligence, enhanced due diligence, transaction/activity monitoring, suspicious-transaction reporting, and wire transfers. |
| Saudi Data & AI Authority (SDAIA) | [AI Ethics Assessment](https://dgp.sdaia.gov.sa/wps/portal/pdp/services/servicesdetails/AIEthicsAssessment/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8ziPR1dzTwMgw2MDMOcTA3MjH39TE29jY0MnI30w9EUhIZZAhUEGvl6OXoaGwQY60cRo98AB3A0IKTfi5ACoA-MinydfdP1owoSSzJ0M_PS8vUjHD1dSzIyk4sdi4tTi4tzU_NKgC6JwmuWhRGGAkzPghXg8U1wYpF-QW5oRJVPWrCnrqMiAAIPg5Q!/dz/d5/L0lHSkovd0RNQU5rQUVnQSEhLzROVkUvZW4!/) | Government self-assessment service intended to assess compliance with ethical standards in the development and application of AI. It supports the demo’s governance claim of human review, explainability, and controlled advisory use. |
| Financial Action Task Force (FATF) | [Risk-Based Approach Guidance](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatfguidanceontherisk-basedapproachtocombatingmoneylaunderingandterroristfinancing-highlevelprinciplesandprocedures.html) | The guidance explains the risk-based approach and points to FATF’s 2014 banking-sector guidance. It notes that national authorities must tailor their regime to country risks and that the document does not override national authorities. |

## Design decision

The application will not state that SAMA, SDAIA, or FATF “approved” its policy or that the model was trained by those bodies. Instead, the report will attach **curated, public, official references** to relevant evidence and label them as explanatory governance context. The deterministic engine will remain the decision source; the AI reasoning engine will only synthesize explanation from the frozen snapshot and this fixed reference catalogue.
