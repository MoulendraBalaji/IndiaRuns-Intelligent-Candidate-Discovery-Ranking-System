# ADR-006: Job Intelligence Architecture

## Context and Problem Statement
The Job Intelligence Agent is responsible for parsing raw job descriptions into structured `JobProfile` contracts. Early designs considered using multiple deterministic pipelines (similar to the Candidate Intelligence Agent). However, job descriptions generally lack the volume of raw text and temporal complexity that resumes have, meaning heavy deterministic feature engineering would be overkill and prone to hallucination/over-extraction.

## Decision
We will use a streamlined architecture relying heavily on a single LLM extraction step, followed by rigorous classification and ontology mapping.

### Job Intelligence Lifecycle
1. **Input**: Raw `JobDocument`.
2. **Validation**: Check for cache hit using document hash.
3. **Extraction**: Single Gemini LLM call to extract raw entities, skills, and constraints.
4. **Classification**: Classify extracted requirements by priority (mandatory vs. preferred) and assign importance weights.
5. **Ontology**: 
   - Map skills using a **Skill Graph** to future-proof semantic matching (e.g., PyTorch -> Deep Learning).
   - Map responsibilities to a **Capability Graph** (e.g., "Deploy ML Models" -> "MLOps").
6. **Complexity**: Deterministically score the role's complexity based on constraints and experience.
7. **Builder**: Construct the final `JobProfile` and a normalized semantic `embedding_text`.
8. **Cache**: Persist the profile to the in-memory cache to prevent redundant LLM calls for identical JDs.
9. **Output**: Return the normalized `JobProfile` via an `AgentResponse`.

## Rationale
* **Why a single LLM call?**: JDs are usually concise. Splitting extraction across multiple LLM calls adds latency and cost without meaningful accuracy gains.
* **Why graph mapping?**: Simple text matching fails when terminologies differ (e.g., JD asks for "Deep Learning", Candidate has "TensorFlow"). Graphs map specific keywords to broader functional capabilities.
* **Why deterministic classification?**: LLMs can extract requirements, but ranking them by priority requires strict schema enforcement that is better handled by predictable code logic.
* **Why caching?**: Job descriptions are frequently queried but rarely change. Caching by JD hash guarantees sub-millisecond retrieval on subsequent parses.
* **Why Job Complexity?**: A Senior AI Architect role requires different evaluation thresholds than an Internship. The Complexity score allows the Evaluation Agent to adapt its ranking logic dynamically.

## Consequences
* **Positive**: Fast, cheap, highly deterministic mapping that extracts capabilities instead of just keywords.
* **Negative**: The ontology graphs (Skill and Capability) must be maintained and expanded over time to capture emerging technologies.
