# SentinelAI — GenAI & RAG Governance Profile

> **Standardized Governance Profile for Sovereign Generative AI & Regulatory RAG within Transaction-Risk Review**  
> **ملف حوكمة الذكاء الاصطناعي التوليدي واسترجاع المعرفة التنظيمية (RAG) في تقييم المخاطر المالية**

---

## 1. Purpose & Scope

This profile defines the operational boundaries, data-isolation standards, and safety invariants governing **Generative AI** and **Retrieval-Augmented Generation (RAG)** within SentinelAI. 

Financial risk decisions require absolute auditability and legal defensibility. To eliminate hallucinations, bias, and compliance violations, SentinelAI enforces a **Constrained Governance Model** where generative reasoning acts strictly in an explanatory and advisory capacity to assist certified human investigators.

---

## 2. Core Governance Invariants

### Invariant 1: Grounded Exclusively in Frozen Case Facts
- The AI reasoning model (Local Sovereign AI / Dedicated Inference Engine) receives only the immutable **Decision Snapshot** JSON payload.
- The model is cryptographically and procedurally prohibited from querying external unverified databases or inventing synthetic counterparty facts.
- Context isolation prevents prompt injection and cross-session data bleeding.

### Invariant 2: Curated & Authorized Regulatory Knowledge Base
- RAG retrieval is restricted to a curated corpus of official supervisory publications:
  1. **Saudi Central Bank (SAMA):** Anti-Money Laundering Law & Counter-Terrorist Financing Rules.
  2. **Saudi Data & AI Authority (SDAIA):** National Data Governance Principles & AI Ethics Framework.
  3. **Financial Action Task Force (FATF):** Risk-Based Approach Guidance for Digital Financial Services.
- The RAG pipeline attaches verified article numbers and official source URLs directly to the investigation dossier.

### Invariant 3: Mandatory Policy Primacy (No AI Override)
- The **14-Stage Deterministic Policy Engine** holds final authority over risk scores ($0-100$) and risk tiers (`Low`, `Medium`, `High`, `Critical`).
- **Mandatory Policy Overrides** (e.g. High-Risk Merchant Domain, Sanctions List Trigger) cannot be lowered, bypassed, or mitigated by generative AI or statistical ML signals.
- If an AI narrative attempts to suggest an unauthorized policy downgrade, bidirectional safety sanitizers intercept the output and enforce the deterministic baseline.

### Invariant 4: Human-in-the-Loop Authority & Non-Repudiation
- All AI-generated briefs and suggested review actions are explicitly marked as **Advisory Evidence**.
- Final transfer disposition (`Approve`, `Reject`, `Escalate to Compliance Committee`) is executed exclusively by authorized human analysts.
- Every analyst action, simulation query, and AI explanation turn is timestamped and cryptographically logged in the immutable **14-Stage Audit Trail**.

---

## 3. Boundary & Protection Matrix

| Component | Allowed Capabilities | Prohibited Operations | Safeguard Mechanism |
|---|---|---|---|
| **Local / Sovereign LLM** | Synthesize frozen case facts; explain triggered factors in Arabic/English; propose review checklists. | Alter risk scores; decide transfer outcome; cite unverified external URLs. | Rigid prompt boundaries, schema-conforming parser, and deterministic completion bridges. |
| **Regulatory RAG** | Retrieve exact supervisory clauses mapped to active factor codes. | Modify rule weights; mandate outcomes; hallucinate legal authority mandates. | Fixed authoritative reference catalogue with explicit disclaimer tags. |
| **Investigation Chatbot** | Answer analyst queries regarding active case facts; execute non-persistent "What-If" sandbox simulations. | Mutate persistent database records; alter historical baseline data. | Non-persistent session flag, read-only context binding, and simulation watermarks. |
| **Audit Logger** | Log 14-stage execution timestamps, factor codes, analyst decisions, and model outputs. | Delete, edit, or overwrite historic transaction logs. | Immutable append-only record store with SHA-256 integrity checksums. |

---

## 4. Regulatory Alignment & Compliance Assurance

This governance profile conforms to the following national and international standards:

- **SDAIA AI Ethics Framework (Transparency & Accountability):** Transparent separation between deterministic policy outcomes and generative explanations.
- **SAMA Cyber & Fraud Governance:** Air-gapped / Local execution ensuring Zero PII leakage across cloud boundaries.
- **FATF Recommendation 10 & 16:** Complete traceability of wire transfer originator and beneficiary evaluation factors.

---

<div align="center">
  <sub>Document Version: 1.2.0 · Maintained by <strong>SentinelAI Governance & Risk Committee</strong></sub>
</div>
