# RAG Diversity Audit

## Diagnosis — 22 August 2026

The persisted retrieval trace showed that recent transaction reports displayed only SAMA citations, despite FATF chunks being indexed. The matching SQL function capped all candidates at three rows before application-level diversification ran. Those three closest rows were often different SAMA chunks, so FATF never reached the diversification stage.

## Remediation

The candidate window is expanded to eight approved chunks, with the application still rendering at most three citations. Queries now request directly relevant Saudi AML/CFT context together with directly relevant FATF context. SDAIA remains reserved for AI-governance questions because it is not a transaction-monitoring authority and should not be inserted merely to create visual variety.
