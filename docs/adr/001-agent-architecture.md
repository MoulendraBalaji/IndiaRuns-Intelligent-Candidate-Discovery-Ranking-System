# ADR 001: Agent Architecture

## Status
Accepted

## Context
The initial design proposed 10 LLM agents that performed repetitive reading of resume fields (Resume, Skill, Career, Project, Authenticity, Growth). This resulted in ~800 LLM calls per ranking job for 100 candidates, inflating latency (12-15s P95) and cost unnecessarily. Furthermore, identical contexts were being evaluated separately by Recruiter, Hiring Manager, and Behavioral agents.

## Decision
We will consolidate the agent architecture into **5 Agents + 1 Deterministic Engine**:
1. **Job Intelligence Agent** (Ingestion-time)
2. **Candidate Intelligence Agent** (Ingestion-time, 1 LLM call + 5 Python analyzers)
3. **Evaluation Agent** (Query-time, merges Recruiter, HM, and Behavioral perspectives)
4. **Explainability Agent** (Lazy query-time, human narrative generation)
5. **Recruiter Copilot** (User-initiated LangGraph chat with tools)

## Consequences
- **Positive**: Hot-path LLM calls drop from ~800 to ~101. Cost is reduced by ~87%. Latency is reduced by ~60%. Better cohesion across evaluation perspectives.
- **Negative**: The Evaluation Agent prompt becomes more complex. We must ensure the `skill_gap` computation provided as context to the LLM remains robust.
