# ADR 002: Deterministic Ranking Engine

## Status
Accepted

## Context
The initial design indicated an LLM would act as an "Adaptive Ranking Engine" to produce the final rank of candidates. Using an LLM to generate the final rank introduces non-determinism, making the ranking non-reproducible and harder to audit for compliance and fairness.

## Decision
The Ranking Engine is separated from the ML models entirely. It will be implemented as a **deterministic, pure Python business logic component** under `domain/ranking/`. It will consume structured scores from the Evaluation Agent, Semantic Retrieval, and Ingestion Scores, applying predefined, role-specific weight matrices to calculate a final Hiring Relevance Score (HRS).

## Consequences
- **Positive**: 100% reproducible rankings. Full auditability (we can store the exact weights and inputs used). 
- **Positive**: Zero LLM cost for the ranking sort phase itself.
- **Negative**: Weight profiles must be managed and tuned manually per role type (e.g., "research", "leadership"), which requires domain expertise.
