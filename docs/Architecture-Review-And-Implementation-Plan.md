# NEXUS — Architecture Review & Redesign
### Staff Engineer Review | v2.0 | 2026

> This document is an engineering critique and redesign of the NEXUS AI Hiring Intelligence Platform.  
> Product vision is preserved. Architecture is rebuilt from first principles.

---

## Phase 1 — Architecture Review: What's Wrong and Why

### 1.1 The Core Tension

The original documentation describes a well-reasoned product vision but makes a critical architectural error: it treats every evaluation problem as an LLM problem. This is the single most expensive mistake in AI system design. When you reach for an LLM by default, you pay in latency, cost, and non-determinism for every invocation. Many of the "agents" in NEXUS are not agents — they are structured extraction tasks, scoring functions, or lookup operations that should run as pure Python.

The second core error is conflating **agent count** with **intelligence**. Eight parallel LangGraph agents each invoking Gemini per candidate, for 100 candidates, produces 800 LLM calls per ranking job. At $0.05/job target with Gemini Flash pricing (~$0.075/1M input tokens), this math does not close unless each call is tiny and every agent result is cached aggressively.

The third error is **missing a separation between ingestion-time and query-time computation**. Much of what the docs describe as ranking-time agent work should happen at resume ingestion time, cached in the candidate profile, and never recomputed.

---

### 1.2 Issue Catalog

#### ISSUE-01: Duplicated LLM Responsibilities Between Agents

**What:** The Resume Intelligence Agent (Agent 02) extracts `skills[]`, `projects[]`, `work_history[]`. The Skill Intelligence Agent (Agent 03) then re-reads `skills[]`. The Authenticity Agent (Agent 07) re-reads `projects[]`, `certifications[]`, and `work_history[]`. The Career Intelligence Agent (Agent 05) re-reads `work_history[]`.

**Why this is wrong:** Three separate LLM calls consume the same resume data fields that were already extracted in one LLM call. This is redundant I/O with no justification. The original document frames this as "each agent does one thing" (SRP), but SRP applies to code modules — not LLM invocations. Splitting reads across LLM calls multiplies cost without adding capability.

**Fix:** Agents 03, 05, 06, and 07 should NOT call the LLM. They should operate on the already-structured `CandidateProfile` output from Agent 02 using pure Python scoring functions. The LLM is needed once to extract structure; deterministic functions handle scoring.

---

#### ISSUE-02: Eight LLM Agents Per Candidate at Ranking Time

**What:** The ranking pipeline runs all 8 agents per candidate, per ranking job. For K=100 candidates, this is up to 800 LLM calls in the hot path.

**Why this is wrong:** Most of these computations are **candidate-level invariants** — they do not change based on the job. Skill analysis, career trajectory, project complexity, and behavioral scores are properties of the candidate, not the job-candidate pair. Running them at ranking time for every job query is wasteful. If Candidate Alice applies to 5 jobs, her career trajectory should be computed once at upload time and stored.

**Fix:** Split agents into two classes:
- **Ingestion-time agents** (run once, stored in CandidateProfile): Skill extraction, career analysis, project complexity, behavioral signals, authenticity cross-validation, growth potential base score.
- **Query-time agents** (run per job-candidate pair): Job-relevance scoring (Recruiter perspective, HM perspective), skill gap delta against specific JD, contextual explanation generation.

This reduces ranking-time LLM calls from ~8 per candidate to ~2 per candidate, plus one explanation call for top-N only.

---

#### ISSUE-03: Over-Engineered LangGraph State Machine for Stateless Operations

**What:** LangGraph is used to orchestrate parallel agent execution. LangGraph is designed for **stateful, cyclic agent graphs** — where agents loop, retry, call tools, and have conditional edges based on intermediate state. The described pipeline is a linear fan-out/fan-in with no cycles, no conditional branching based on agent outputs, and no tool-calling loops.

**Why this is wrong:** LangGraph adds serialization overhead (state object marshalling), complexity (graph definition, node registration, state schema), and a library dependency for something that is architecturally equivalent to `asyncio.gather()`. You are paying the LangGraph abstraction cost for a use case that does not need it.

**Fix:** Replace the LangGraph orchestrator with a native `asyncio.gather()` pipeline. Keep LangGraph in scope for the Recruiter Copilot's RAG-with-tool-calling flow, which genuinely has conditional branching and session state. This is the correct use case for an agent framework.

---

#### ISSUE-04: Celery for Ranking is Premature and Adds Operational Complexity

**What:** The docs specify Celery + Redis for async resume processing and parallel agent execution.

**Why this is wrong:** FastAPI is async-native. Background tasks that fit within a request-response window (< 30s) can be handled by `asyncio` + `BackgroundTasks` or a simple task queue without Celery's operational overhead (separate worker processes, Beat scheduler, serialization, monitoring). Celery adds two containers, serialization format decisions, and retry/failure state management that must be maintained.

**Fix:** For hackathon/MVP scope:
- Use FastAPI `BackgroundTasks` for non-blocking resume processing (fire-and-forget with webhook).
- Use Python `asyncio.gather()` for parallel agent execution within a request.
- Add Celery only if batch-upload queue depth exceeds what a single async worker pool can handle, or if jobs require cross-restart durability.
- Keep Redis purely as cache and session store.

If you insist on a job queue (which is legitimate for batch upload), use **ARQ** (Async Redis Queue) — it's async-native Python, uses Redis directly, and requires no separate worker supervisor.

---

#### ISSUE-05: Skill Intelligence Agent Calls LLM for Ontology Matching

**What:** Agent 03 uses "LLM-generated skill expansion at runtime for unknown skills." This means every unknown skill triggers an LLM call during ranking.

**Why this is wrong:** Ontology expansion is fundamentally a graph lookup problem. Given a predefined YAML taxonomy with 500+ skills and their semantic relationships, matching `Kafka → Message Queues → Streaming` is a tree traversal, not a reasoning problem. LLM expansion for unknown skills should happen at **taxonomy maintenance time** (a background job that enriches the YAML when a new skill is first seen), not at request time.

**Fix:** Pre-build the skill ontology as a directed graph (`networkx.DiGraph`). Implement graph BFS from any skill node to find semantic parents/siblings. Use embedding cosine similarity (BGE-M3) for skills not in the graph. Only call LLM when a truly novel skill is seen for the first time, adding it to the graph for future use. Cache the enriched graph in Redis.

---

#### ISSUE-06: Explanation Agent Runs on ALL Top-N Candidates, Not Just Shortlist

**What:** The docs say explanations are generated for "top-N candidates." With N=50 (API max), this is 50 LLM explanation calls, which is the second-most expensive step in the pipeline.

**Why this is wrong:** Recruiters view 5-10 candidates in detail. Generating explanations for 50 wastes ~80% of explanation compute. Furthermore, the explanation requires the most detailed, evidence-grounded reasoning — making it the longest LLM call.

**Fix:** Generate explanations lazily. Return rankings without explanations by default. Generate explanation on-demand when a recruiter clicks a candidate row (via `GET /rank/{job_id}/candidate/{cid}/explanation`). Cache the result in Redis (TTL=24h). This turns the worst case from 50 LLM calls to ~5 (the candidates actually viewed). This is a massive cost and latency reduction.

---

#### ISSUE-07: Copilot Session Storage in Redis Only

**What:** Copilot sessions are stored in Redis with a 2-hour TTL. The docs mention that `copilot_sessions` has a PostgreSQL table but the flow diagram reads from Redis.

**Why this is wrong:** Redis TTL-based session storage loses conversation history after 2 hours. For an enterprise hiring platform where a recruiter might return to review candidates the next day, this is unacceptable. Additionally, the RAG retrieval for the copilot re-queries Qdrant on every message, which is expensive if the session context hasn't changed.

**Fix:**
- Persist all copilot messages to PostgreSQL as the source of truth.
- Use Redis as a hot session cache (2-hour TTL) with write-through to PostgreSQL.
- Cache the retrieved context chunks in Redis per session+message_hash (since the same question often retrieves the same chunks).

---

#### ISSUE-08: Qdrant project_embeddings Collection is Premature

**What:** A third Qdrant collection (`project_embeddings`) is specified for project-level semantic matching.

**Why this is wrong:** Querying three Qdrant collections per ranking job (job_embeddings, candidate_embeddings, project_embeddings) triples retrieval complexity and adds index maintenance burden. Project-level similarity to JD responsibilities can be computed during ingestion time using BGE-M3 cosine similarity in Python (since both project descriptions and JD responsibilities are already embedded). The result is a `project_relevance_score` stored in the CandidateProfile JSON — no need for a live Qdrant query.

**Fix:** Compute project-JD relevance offline (at ingestion) and store the top-3 relevant projects per candidate as a scored list in PostgreSQL JSONB. Remove `project_embeddings` collection from production scope.

---

#### ISSUE-09: Missing Database Indexes

**What:** The schema defines tables without specifying indexes, and uses unbounded JSONB blobs.

**Critical missing indexes:**
- `rankings(job_id, final_score DESC)` — every ranking query sorts by this
- `candidates(tenant_id, created_at DESC)` — list queries are always tenant-scoped
- `candidates(file_hash)` — deduplication check on upload
- `agent_logs(ranking_id)` — audit trail lookups
- GIN index on `candidates.skills` — TEXT[] filter queries

**Fix:** Add explicit index definitions to the migration scripts and document them in the schema.

---

#### ISSUE-10: JWT_SECRET as Symmetric Key for RS256

**What:** The env var table lists `JWT_SECRET` as a `your-256-bit-secret` string while the text says RS256 (asymmetric). These are mutually exclusive. RS256 uses a private/public key pair, not a shared secret.

**Fix:** Change to `JWT_PRIVATE_KEY` (PEM-encoded RSA private key for signing) and `JWT_PUBLIC_KEY` (for verification). For development, HS256 with a 256-bit secret is fine — just don't mislabel it.

---

#### ISSUE-11: Recruiter Agent and Hiring Manager Agent Have Unclear Differentiation

**What:** Both Recruiter Agent and HM Agent evaluate the same candidate against the same JD and return the same output schema (`score, justification, signals_detected, risks_or_gaps`). The differentiation is only in "perspective" (recruiter lens vs. technical lens).

**Why this is wrong:** Two LLM calls with different system prompts over the same data to produce the same schema is not "multi-agent reasoning" — it is the same reasoning with different personas. This is the "multiple perspectives" pattern masquerading as specialized agents, doubling cost for marginal differentiation.

**Fix:** Merge Recruiter + HM into a single `ContextualRelevanceAgent` that produces two scored perspectives in one structured output call. Gemini's function calling can return a schema with `{recruiter_view: {...}, hiring_manager_view: {...}}` in a single call. This halves the LLM calls for the hottest path.

---

#### ISSUE-12: No Rate Limiting on Gemini API Calls (Only on Recruiter Requests)

**What:** Redis token bucket rate limiting is applied to recruiter API requests (100/min). But there is no internal rate limiter on outbound Gemini API calls.

**Why this is wrong:** If 10 recruiters each trigger a ranking job simultaneously, the backend sends 100 × 10 × 2 LLM calls = 2,000 Gemini requests in seconds, likely hitting the API quota. There is no backpressure mechanism.

**Fix:** Implement a semaphore on the LLM router (`llm_router.py`) limiting concurrent Gemini calls (e.g., max 20 concurrent). Add exponential backoff with jitter on 429 responses. Track per-minute Gemini call rate in Redis and queue excess calls rather than failing.

---

#### ISSUE-13: Tenant Isolation Only at Application Layer, Not DB Layer

**What:** The docs say "each company's data namespaced in Qdrant collections and PostgreSQL schemas" but the actual schema shows a single shared database with `tenant_id` foreign keys. PostgreSQL row-level security (RLS) is not mentioned.

**Why this is wrong:** Application-layer tenant isolation means a single ORM bug or missing WHERE clause leaks cross-tenant data. For a hiring platform storing candidate PII, this is a serious security gap.

**Fix:** Enable PostgreSQL Row-Level Security on `candidates`, `rankings`, and `jobs` tables, enforcing `tenant_id = current_setting('app.current_tenant_id')`. Set `current_setting` at connection checkout from the pool. This enforces isolation at the database layer, independent of application code.

---

### 1.3 What the Original Architecture Gets Right

To be fair: the core product intuitions are sound. Separating retrieval (Qdrant) from reasoning (LLM) is architecturally correct and the right mental model. BGE-M3 for free multilingual embeddings is a good call. Authenticity verification is a genuinely differentiated feature. The adaptive ranking weights per role type solve a real problem without needing a learned LTR model (which would require training labels you don't have). The explainability requirement (evidence-grounded, not generic) is the right quality bar. These stay unchanged.

---

## Phase 2 — Redesigned ML Architecture

### 2.0 Design Philosophy

> **LLM calls are network I/O with nondeterministic latency and variable cost. Every LLM call that could be replaced by a deterministic function should be.**

The redesigned ML pipeline separates computation into three tiers:

1. **Ingestion-time** (once per candidate, cached forever): Entity extraction, structural analysis, candidate-level scores.
2. **Index-time** (once per candidate per embedding update): Vector generation, semantic indexing.
3. **Query-time** (per ranking job): Job-relevance scoring, gap analysis, explanation generation (lazy).

This reduces ranking-time LLM calls from **~8 per candidate** to **~1.5 per candidate average** (2 for the relevance agent, 1 explanation amortized over ~5 views).

---

### 2.1 Job Intelligence Module

| Field | Detail |
|---|---|
| **Purpose** | Parse raw JD into a structured, embedding-ready `JobProfile` with explicit and implicit requirements |
| **When** | Once per JD submission (ingestion-time) |
| **Input** | `raw_jd: str` |
| **Output** | `JobProfile` (Pydantic, see schema below) |
| **Model** | Gemini 2.5 Flash (structured output / function calling) |
| **Latency** | < 2s P95 |
| **Caching** | Cache by `sha256(raw_jd)` in Redis (TTL=24h). Same JD text submitted again → cache hit |
| **Parallelization** | None needed — single sequential call |

**Pydantic Schema:**
```python
class JobProfile(BaseModel):
    required_skills: list[str]
    preferred_skills: list[str]
    experience_level: Literal["junior", "mid", "senior", "staff", "principal"]
    seniority_tier: int  # 1-5
    industry: str
    domain: str
    soft_skills: list[str]
    role_objectives: list[str]        # explicit from JD
    hidden_expectations: list[str]    # inferred by LLM (production ownership, scale mindset)
    red_flags: list[str]              # signals that would disqualify a candidate
    career_patterns: list[str]        # ideal progression signals for this role
    role_type: Literal["research", "leadership", "junior", "devops", "default"]
    responsibilities: list[str]       # for project relevance matching
```

**Prompt Strategy:** System prompt as "Executive Technical Recruiter with 15 years of hiring experience." Instruct to ignore corporate filler language. Focus on: what does success look like in 90 days? What will kill a candidate in this role? What does the company actually need vs what they wrote? Return strict JSON matching schema.

**Failure Handling:** On LLM failure → fall back to regex-based skill extraction from JD text. Mark `job_profile.extraction_confidence = 0.5` in the response. Never block JD creation on LLM failure.

**Embedding:** After extraction, embed `f"{raw_jd}\n\nKey requirements: {', '.join(required_skills)}\nObjectives: {', '.join(role_objectives)}"` — the enriched representation outperforms embedding raw JD text alone.

---

### 2.2 Candidate Intelligence Module (Ingestion-Time)

This module runs **once per resume upload** and produces a `CandidateProfile` that is stored and never recomputed unless the resume changes.

#### 2.2.1 Resume Parsing (NOT an LLM task)

| Field | Detail |
|---|---|
| **Purpose** | Convert PDF/DOCX bytes to structured text with section boundaries |
| **Model** | Docling (primary), pdfplumber (fallback for scanned PDFs) |
| **Output** | `ParsedResume: {raw_text, sections: {skills, experience, education, projects, certs}}` |
| **Latency** | < 2s P99 |
| **Why not LLM** | Document layout parsing is a deterministic problem. LLM adds cost with no accuracy advantage over Docling for well-formatted resumes. |

#### 2.2.2 Entity Extraction Agent (One LLM call)

| Field | Detail |
|---|---|
| **Purpose** | Extract ALL structured entities from parsed resume in a single LLM call |
| **Model** | Gemini 2.5 Flash (structured output) |
| **Input** | `parsed_resume_text: str` |
| **Output** | `CandidateProfile` (Pydantic, full schema) |
| **Latency** | < 3s P95 |
| **Caching** | Cache by `sha256(resume_text)` in Redis (TTL=7d). Exact duplicate resumes never re-extracted |

**Pydantic Schema:**
```python
class WorkEntry(BaseModel):
    title: str
    company: str
    company_size: Optional[Literal["startup", "mid", "enterprise", "faang"]]
    start_date: str   # ISO format
    end_date: Optional[str]
    is_current: bool
    duration_months: int
    domain: str
    responsibilities: list[str]
    achievements: list[str]
    seniority_evidence: list[str]  # signals of scope/impact

class Project(BaseModel):
    title: str
    description: str
    tech_stack: list[str]
    scale: Optional[str]         # "10k users", "1M req/day", etc.
    business_impact: Optional[str]
    is_production: bool
    complexity_signals: list[str]  # raw textual evidence
    project_type: Literal["academic", "personal", "professional", "open_source"]

class CandidateProfile(BaseModel):
    # Structured entities (LLM-extracted)
    skills_claimed: list[str]
    work_history: list[WorkEntry]
    education: list[EducationEntry]
    projects: list[Project]
    certifications: list[CertEntry]
    github_url: Optional[str]
    total_experience_months: int
    
    # Ambiguity flags for downstream processing
    ambiguous_claims: list[str]    # skills/projects the LLM flagged as vague
```

**Prompt Strategy:** "Technical CV Analyst." Extract with evidence. Do NOT infer — only extract what is written. Flag claims that lack supporting context (e.g., "Led team of X" with no project mentioned). Return structured JSON exactly matching schema.

**Failure Handling:** On LLM failure → store raw parsed text, mark `extraction_status = "pending_retry"`. Background job retries every 5 minutes up to 3 times before marking `extraction_status = "failed"`. Candidate still searchable via keyword fallback.

---

### 2.3 Scoring Modules (Ingestion-Time, Pure Python)

These modules run immediately after entity extraction. They are **pure Python** — no LLM, no network call. They produce normalized scores (0.0–1.0) stored in the `CandidateProfile`.

#### 2.3.1 Career Intelligence Scorer

| Field | Detail |
|---|---|
| **Purpose** | Compute trajectory, stability, and progression velocity from work history |
| **Implementation** | Pure Python — deterministic formulas |
| **Output** | `CareerAnalysis` stored in `CandidateProfile` |
| **Latency** | < 5ms |
| **Why not LLM** | All inputs are structured (dates, titles, companies). Math is sufficient. LLM adds hallucination risk. |

```python
class CareerAnalysis(BaseModel):
    total_experience_months: int
    avg_tenure_months: float
    tenure_stability_score: float     # 0-1; formula below
    promotion_velocity: float         # seniority tier delta / years
    job_hopping_risk: float           # 0-1; ratio of roles < 12m
    domain_depth_score: float         # 0-1; concentration in primary domain
    leadership_growth_signals: int    # count of scope-expansion evidence
    progression_score: float          # composite
    career_phase: Literal["early", "growth", "senior", "leadership"]
```

**Stability Formula (calibrated):**
```
avg_tenure_months = weighted_mean(role_durations, weights=recency_weights)
tenure_stability = clip(avg_tenure_months / 24.0, 0, 1)  # 24m+ = 1.0
job_hopping_risk = len([r for r in roles if r.duration_months < 12]) / len(roles)
# Adjustment: startup stint < 12m with known funding event → penalty reduced by 0.3
```

**Red Flag Detection:**
```python
def detect_red_flags(work_history: list[WorkEntry]) -> list[str]:
    flags = []
    if consecutive_short_tenures(work_history, threshold=12, count=2):
        flags.append("consecutive_short_tenures")
    if declining_seniority(work_history):
        flags.append("declining_title_progression")
    if domain_fragmentation(work_history, threshold=4, years=5):
        flags.append("excessive_domain_switching")
    return flags
```

---

#### 2.3.2 Skill Ontology Matcher

| Field | Detail |
|---|---|
| **Purpose** | Map claimed skills to ontology, compute semantic coverage of any JD skill set |
| **Implementation** | Python + NetworkX graph BFS + BGE-M3 cosine similarity for unknown skills |
| **Data** | `skill_taxonomy.yaml` pre-loaded as `networkx.DiGraph` at service startup |
| **Latency** | < 10ms for graph lookup; < 50ms if embedding fallback triggered |
| **Caching** | Skill graph cached in-process at startup. Unknown skill embeddings cached in Redis |

**Ontology Score Mapping:**
```python
MATCH_WEIGHTS = {
    "exact":          1.00,
    "alias":          0.95,   # "Kafka" and "Apache Kafka"
    "parent":         0.80,   # "Message Queues" covers "Kafka"
    "sibling":        0.60,   # "RabbitMQ" when "Kafka" required
    "related_domain": 0.40,   # "Redis Streams" when "Kafka" required
    "no_match":       0.00,
}

def match_skill(claimed: str, required: str, graph: nx.DiGraph) -> float:
    relationship = graph_relationship(claimed, required, graph)
    if relationship is None:
        # Fall back to embedding cosine similarity
        sim = cosine_similarity(embed(claimed), embed(required))
        return 0.4 * sim  # cap at 0.4 for unknown graph relationships
    return MATCH_WEIGHTS[relationship]
```

**Unknown Skill Expansion:** When a skill is not in the graph, compute its embedding and find the nearest graph node (within cosine > 0.75). Add the new skill as a graph node with the found parent. Persist the enriched graph to disk. Future lookups hit the graph.

---

#### 2.3.3 Project Complexity Scorer

| Field | Detail |
|---|---|
| **Purpose** | Score projects by production realism, scale, and technical depth |
| **Implementation** | Pure Python heuristics + embedding similarity |
| **Why not LLM** | Project complexity can be estimated by signals (production flag, scale mentions, tech stack depth, business impact). LLM adds 2–3s latency for marginal accuracy gain over heuristics on structured data. LLM reserved for ambiguous cases only. |

```python
class ProjectScore(BaseModel):
    title: str
    complexity_score: float     # 0-10
    is_production: bool
    scale_tier: Literal["toy", "small", "medium", "large", "hyperscale"]
    tech_depth: float           # count of distinct layers / max_observed
    business_impact_detected: bool
    ownership_level: Literal["contributor", "lead", "owner", "architect"]
    jd_relevance_score: float   # cosine similarity to JD responsibilities (computed at query time)
```

**Heuristic Scoring:**
```python
def score_project(project: Project) -> ProjectScore:
    score = 0.0
    
    # Scale signals (each adds to score)
    if project.scale and any(kw in project.scale for kw in ["million", "1M", "10M", "billion"]):
        score += 3.0
    elif any(kw in project.scale for kw in ["thousand", "1k", "10k"]):
        score += 1.5
    
    # Production signal
    if project.is_production:
        score += 2.0
    if project.project_type == "academic":
        score -= 2.0  # penalty, but floor at 0
    
    # Tech depth (number of distinct architectural layers used)
    layers = classify_tech_layers(project.tech_stack)
    score += min(len(layers) * 0.5, 2.0)
    
    # Business impact
    if project.business_impact:
        score += 1.5
    
    return ProjectScore(complexity_score=clip(score, 0, 10), ...)
```

---

#### 2.3.4 Authenticity Scorer

| Field | Detail |
|---|---|
| **Purpose** | Cross-validate skill claims against project descriptions, certifications, work history |
| **Implementation** | Pure Python — evidence counting with recency weighting |
| **Why not LLM** | This is a structured lookup problem: does skill X appear in project descriptions? Certs? Work history? Boolean checks + counting. LLM is expensive for what is fundamentally a set intersection. |

```python
def compute_authenticity(profile: CandidateProfile) -> dict[str, SkillAuthenticity]:
    result = {}
    for skill in profile.skills_claimed:
        evidence = []
        
        # Check projects
        proj_mentions = [p.title for p in profile.projects 
                         if skill_mentioned_in(skill, p.description + " " + " ".join(p.tech_stack))]
        evidence.extend([f"Project: {p}" for p in proj_mentions])
        
        # Check certifications  
        cert_matches = [c.name for c in profile.certifications 
                        if skill_covered_by_cert(skill, c.name)]
        evidence.extend([f"Cert: {c}" for c in cert_matches])
        
        # Check work history
        role_mentions = [w.company for w in profile.work_history 
                         if skill_mentioned_in(skill, " ".join(w.responsibilities))]
        evidence.extend([f"Role at {r}" for r in role_mentions])
        
        # Recency bonus (evidence from last 24 months)
        recency_weight = compute_recency_weight(profile, skill)
        
        evidence_count = len(evidence)
        base_confidence = min(evidence_count * 0.25, 0.90)  # cap at 0.90 
        confidence = clip(base_confidence * recency_weight, 0.10, 0.95)
        
        result[skill] = SkillAuthenticity(
            claimed=True,
            evidence=evidence,
            confidence=confidence
        )
    return result
```

---

#### 2.3.5 Behavioral Signal Scorer

| Field | Detail |
|---|---|
| **Purpose** | Estimate hiring readiness and learning velocity from observable signals |
| **Implementation** | Pure Python formula |
| **Input** | Voluntarily submitted activity signals only (no scraping) |

```python
def score_behavioral(signals: ActivitySignals) -> BehavioralScore:
    # Recency score (0-1)
    days_since_update = (today() - signals.profile_update_date).days
    recency = max(0, 1 - (days_since_update / 90))  # linear decay over 90 days
    
    # Cert velocity (certs per year in last 3 years)
    cert_velocity = compute_cert_velocity(signals.certifications, years=3)
    cert_score = min(cert_velocity / 2.0, 1.0)  # 2 certs/year = 1.0
    
    # GitHub activity (if URL provided)
    github_score = 0.5  # default neutral if not provided
    if signals.github_last_active_days is not None:
        github_score = max(0, 1 - (signals.github_last_active_days / 30))
    
    engagement = 0.4 * recency + 0.3 * cert_score + 0.3 * github_score
    hiring_readiness = "active" if recency > 0.7 else "passive" if recency > 0.3 else "dormant"
    
    return BehavioralScore(engagement_score=engagement * 100, hiring_readiness=hiring_readiness)
```

---

#### 2.3.6 Growth Potential Scorer

| Field | Detail |
|---|---|
| **Purpose** | Predict trajectory from historical signals |
| **Implementation** | Pure Python formula over already-computed scores |
| **Why not LLM** | All inputs are numerical outputs from prior scoring stages. This is a weighted sum. |

```python
def score_growth(career: CareerAnalysis, behavioral: BehavioralScore, 
                 projects: list[ProjectScore]) -> GrowthScore:
    # Project complexity trend (slope of complexity over time)
    if len(projects) >= 2:
        complexity_slope = linear_slope([p.complexity_score for p in projects])
    else:
        complexity_slope = 0.5  # neutral default
    
    complexity_trend = clip((complexity_slope + 1) / 2, 0, 1)  # normalize [-1,1] to [0,1]
    cert_velocity = behavioral.cert_velocity_normalized
    title_acceleration = career.promotion_velocity / 2.0  # normalize
    
    gp = (
        0.40 * complexity_trend +
        0.30 * cert_velocity +
        0.20 * clip(title_acceleration, 0, 1) +
        0.10 * (behavioral.engagement_score / 100)
    )
    
    return GrowthScore(
        growth_potential=gp * 100,
        trajectory_direction="up" if gp > 0.65 else "flat" if gp > 0.40 else "down",
        time_to_senior_estimate_months=estimate_time_to_senior(career)
    )
```

---

### 2.4 Semantic Retrieval Module

| Field | Detail |
|---|---|
| **Purpose** | Given a job profile, retrieve the top-K semantically similar candidates from Qdrant |
| **Model** | BGE-M3 (ONNX-optimized, local) |
| **Latency** | < 200ms P99 for K=100 from 10k candidates |
| **Caching** | Candidate embeddings cached in Redis (TTL=7d). Job embedding cached (TTL=2h). |

**Embedding Strategy:**

*Candidate embedding:* Do not embed raw resume text — this embeds formatting noise. Embed a structured summary:
```python
def build_candidate_embedding_text(profile: CandidateProfile) -> str:
    top_skills = ", ".join(profile.skills_claimed[:20])
    top_project = profile.projects[0].description if profile.projects else ""
    recent_role = f"{profile.work_history[0].title} at {profile.work_history[0].company}" if profile.work_history else ""
    
    return f"Skills: {top_skills}\nMost recent role: {recent_role}\nKey project: {top_project}\nExperience: {profile.total_experience_months // 12} years"
```

*Job embedding:* Embed enriched JD (raw text + extracted objectives):
```python
def build_job_embedding_text(raw_jd: str, profile: JobProfile) -> str:
    return f"{raw_jd}\n\nRequired: {', '.join(profile.required_skills)}\nObjectives: {', '.join(profile.role_objectives)}\nHidden expectations: {', '.join(profile.hidden_expectations)}"
```

**Qdrant Payload Filters (applied before ANN search — reduces candidate pool before scoring):**
```python
filters = {
    "must": [{"key": "tenant_id", "match": {"value": tenant_id}}],
    "should": []
}
if min_experience_years:
    filters["must"].append({
        "key": "experience_years", 
        "range": {"gte": min_experience_years}
    })
```

**Qdrant Collections (revised — 2, not 3):**
- `candidate_embeddings`: 1024-dim BGE-M3, payload: `{candidate_id, tenant_id, skills[], experience_years, career_phase}`
- `job_embeddings`: 1024-dim BGE-M3, payload: `{job_id, tenant_id, role_type, required_skills[]}`
- ~~`project_embeddings`~~: Removed. Project-JD relevance is computed offline at ingestion.

---

### 2.5 Query-Time Evaluation: Contextual Relevance Agent (ONE LLM call per candidate)

This is the only LLM call in the ranking hot path. It answers the question a retrieval score cannot: **"Given this specific job and this specific candidate's background, how relevant are they — and what are the gaps?"**

| Field | Detail |
|---|---|
| **Purpose** | Job-specific relevance scoring from recruiter and hiring manager perspectives |
| **Model** | Gemini 2.5 Flash (structured JSON output) |
| **Input** | `(AnonymizedCandidateProfile, JobProfile)` pair |
| **Output** | `ContextualRelevance` (Pydantic) |
| **Latency** | < 2s P95 per candidate |
| **Parallelization** | `asyncio.gather()` across all K candidates simultaneously |
| **Caching** | Cache by `sha256(candidate_id + job_id)` in Redis (TTL=1h). Same candidate-job pair never re-scored within a session. |

```python
class ContextualRelevance(BaseModel):
    recruiter_score: float          # 0-100: "Would I advance this to interview?"
    recruiter_reasoning: list[str]  # 2-3 specific observations
    hm_score: float                 # 0-100: "Can they do the technical work?"
    hm_reasoning: list[str]         # 2-3 technical capability observations
    skill_gaps: list[str]           # required skills not evidenced in profile
    skill_matches: list[str]        # required skills well-evidenced
    semantic_skill_matches: list[str]  # ontology-level matches (Kafka→Message Queues)
    context_fit_score: float        # 0-100: domain, industry, company-size alignment
```

**Prompt Strategy:**
```
System: You are an AI hiring evaluation panel evaluating candidates for technical roles.
You think from two perspectives simultaneously:
1. Recruiter (cultural fit, communication clarity, career trajectory coherence, hiring intent)
2. Hiring Manager (technical depth, project quality, hands-on evidence of required skills)

Rules:
- Score only on EVIDENCE in the profile. Do not infer unstated skills.
- If a skill is not explicitly mentioned, it is a gap — not an assumption.
- Be calibrated: 90+ requires exceptional evidence; 70-80 is "solid match"; below 60 is "significant gaps"

Return valid JSON matching the provided schema.
```

**Failure Handling:** If Gemini call fails (timeout or error), use: `ContextualRelevance(recruiter_score=50.0, hm_score=50.0, skill_gaps=[], ..., _failed=True)`. The candidate is not excluded. A warning flag is set in the ranking output. P95 latency budget per candidate is 2.5s; timeout at 4s.

---

### 2.6 Adaptive Ranking Engine (Pure Python)

| Field | Detail |
|---|---|
| **Purpose** | Combine all scores into final Hiring Relevance Score with role-aware weights |
| **Implementation** | Pure Python — weighted arithmetic mean |
| **Latency** | < 1ms per candidate |

```python
WEIGHT_PROFILES = {
    "default":    {"semantic": 0.25, "recruiter": 0.20, "hm": 0.20, "skill": 0.15, "career": 0.10, "behavioral": 0.05, "growth": 0.05},
    "research":   {"semantic": 0.35, "hm": 0.25, "skill": 0.20, "career": 0.10, "recruiter": 0.05, "growth": 0.05, "behavioral": 0.00},
    "leadership": {"career": 0.30, "hm": 0.25, "recruiter": 0.20, "skill": 0.10, "behavioral": 0.10, "growth": 0.05, "semantic": 0.00},
    "junior":     {"growth": 0.30, "skill": 0.25, "project": 0.20, "recruiter": 0.15, "semantic": 0.10, "behavioral": 0.00, "career": 0.00},
    "devops":     {"skill": 0.30, "hm": 0.25, "semantic": 0.20, "career": 0.15, "authenticity": 0.10, "recruiter": 0.00, "growth": 0.00},
}

def compute_hrs(scores: CandidateScores, role_type: str) -> HiringRelevanceScore:
    weights = WEIGHT_PROFILES.get(role_type, WEIGHT_PROFILES["default"])
    
    score_map = {
        "semantic": scores.semantic_similarity * 100,
        "recruiter": scores.contextual.recruiter_score,
        "hm": scores.contextual.hm_score,
        "skill": compute_skill_coverage(scores.skill_matches, scores.required_skills),
        "career": scores.career.progression_score * 100,
        "behavioral": scores.behavioral.engagement_score,
        "growth": scores.growth.growth_potential,
        "authenticity": compute_avg_confidence(scores.authenticity),
        "project": compute_avg_project_score(scores.projects),
    }
    
    hrs = sum(weights.get(k, 0.0) * v for k, v in score_map.items())
    
    return HiringRelevanceScore(
        final_score=round(hrs, 2),
        weights_used=weights,
        score_breakdown=score_map,
        confidence=compute_score_confidence(scores),
    )
```

**Score Calibration:** To prevent clustering (all candidates scoring 78-82), apply a **ranking-relative normalization** after computing raw HRS across the pool. Shift the distribution so top candidate = 95, median = 50, bottom = 15. This makes visual differentiation meaningful.

---

### 2.7 Explainability Module (Lazy, Per-Demand)

| Field | Detail |
|---|---|
| **Purpose** | Generate evidence-grounded, recruiter-readable explanation for a specific ranked candidate |
| **Model** | Gemini 2.5 Flash (chain-of-thought → structured output) |
| **When** | On-demand — triggered by recruiter clicking a candidate row |
| **Input** | `(RankedCandidate, JobProfile, AnonymizedCandidateProfile, all_agent_scores)` |
| **Output** | `Explanation` (Pydantic) |
| **Latency** | < 3s P95 |
| **Caching** | Redis key `explanation:{job_id}:{candidate_id}` TTL=24h |

```python
class Explanation(BaseModel):
    overall_match: str                    # 1 sentence summary
    confidence_score: float               # 0-1
    why_selected: list[str]               # 3-5 evidence-backed reasons (not generic)
    missing_skills: list[str]             # required skills not evidenced
    hiring_risks: list[str]               # specific concerns (not "limited experience")
    growth_upside: str                    # if growth score is high
    interview_questions: list[str]        # 3-5 questions targeting gaps and risks
    upskilling_recommendation: str        # specific, time-bound recommendation
    evidence_sources: list[str]           # which profile fields support each point
```

**Prompt Strategy (chain-of-thought then structure):**
```
System: You are writing an explanation for a hiring team about why this candidate 
was ranked #{rank} for the role of "{role_title}".

Instructions:
1. THINK: Review the score breakdown: {score_breakdown}
2. GROUND: Every "why_selected" point must cite a specific project, role, or certification from the profile
3. SPECIFIC: Do not write "has strong Python skills" — write "5 years of Python evidenced by 3 production ML pipelines at XYZ Corp"
4. RISKS: Be direct about risks. "No Kubernetes experience — required for this DevOps role" not "may need K8s training"
5. QUESTIONS: Write questions that probe the exact gaps and risks identified

Candidate profile: {anonymized_profile}
Job requirements: {job_profile}
Score breakdown: {score_breakdown}
```

**Hallucination Prevention:**
- All `why_selected` points must reference `evidence_sources` that map to actual profile fields.
- Post-process: verify each cited project/role/cert exists in the profile. If not found, replace with a flag.

---

### 2.8 Recruiter Copilot (RAG + Streaming)

| Field | Detail |
|---|---|
| **Purpose** | Natural language interface over ranking context for interrogation and comparison |
| **Framework** | LangGraph (correctly applied here — stateful, tool-calling, conditional edges) |
| **Model** | Gemini 2.5 Flash with streaming |
| **Retrieval** | Qdrant query over copilot-specific collection (ranking explanations + candidate summaries) |
| **Streaming** | SSE via FastAPI `StreamingResponse` |
| **Session** | PostgreSQL (durable) + Redis (hot cache, 2h TTL) |

**Tools available to the Copilot LangGraph agent:**
```python
tools = [
    get_candidate_details,          # Fetch full profile for a candidate_id
    compare_candidates,             # Side-by-side comparison of 2 candidates
    filter_by_score,               # "Show me candidates with HM score > 80"
    get_skill_gap_summary,         # Aggregate skill gaps across all ranked candidates
    explain_ranking_decision,      # Retrieve explanation for a specific rank position
    get_interview_questions,       # Questions for a specific candidate
]
```

**Context construction per message:**
```python
def build_copilot_context(session: CopilotSession, query: str, job_id: str) -> str:
    # 1. Retrieve ranking summary (from PostgreSQL cache)
    ranking_summary = get_ranking_summary(job_id)
    
    # 2. Query Qdrant for relevant chunks (query against explanation vectors)
    # Only embed + retrieve if query asks about specific candidates
    relevant_chunks = []
    if mentions_candidates(query):
        q_embedding = embed(query)
        relevant_chunks = qdrant.search("copilot_context", q_embedding, limit=5,
                                        filter={"job_id": job_id})
    
    # 3. Conversation history (last 10 messages)
    history = session.messages[-10:]
    
    return build_prompt(ranking_summary, relevant_chunks, history, query)
```

**Caching Strategy:** Cache `sha256(query + job_id)` → response in Redis (TTL=10m) for identical repeated queries. Streaming responses are not cached (write the final assembled text after streaming completes).

**LangGraph Use Justification:** The Copilot genuinely benefits from LangGraph because:
1. The agent may decide to call `get_candidate_details` before answering, then `compare_candidates` — this is a tool-calling loop.
2. Response quality gates: if retrieved context is insufficient, loop back to retrieve more.
3. Session state carried across turns (tool call history, candidate references).

---

### 2.9 ML Pipeline Summary: LLM Call Budget

| Stage | LLM Calls | Per What | Total (100 candidates) |
|---|---|---|---|
| Job Intelligence | 1 | Per JD | 1 |
| Entity Extraction | 1 | Per resume upload (ingestion-time) | Already paid |
| Contextual Relevance | 1 | Per candidate-job pair (query-time) | 100 |
| Explanation | 1 | Per explanation viewed (lazy) | ~5 typical |
| Copilot | ~2-4 | Per user message | As needed |
| **TOTAL ranking hot path** | **~101** | Per job | vs 800 in original |

**Cost estimate:** 100 × Gemini Flash calls, ~2k tokens each = ~200k tokens = **~$0.015 per ranking job**. Well under the $0.05 target.

---

## Phase 3 — Backend Architecture

### 3.1 Design Principles

1. **No shared mutable state across requests** — all state is in storage (PostgreSQL, Redis, Qdrant). Workers are stateless.
2. **Async everywhere** — `asyncpg` (not SQLAlchemy ORM — too much overhead for high-throughput queries), `aioredis`, `qdrant-client` async.
3. **Fail-fast validation** — Pydantic v2 at API boundary. If the request is malformed, return 422 before touching any downstream service.
4. **Explicit over implicit** — no magic decorators hiding behavior. Dependencies injected explicitly via FastAPI `Depends()`.
5. **Repository pattern** — no database queries in route handlers. Repositories own all SQL.

---

### 3.2 Project Folder Structure (Revised)

```
nexus/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app factory + lifespan context
│   │   ├── config.py                   # Pydantic Settings (typed env vars)
│   │   │
│   │   ├── api/
│   │   │   ├── deps.py                 # ALL shared FastAPI dependencies (db session, redis, current_user)
│   │   │   └── v1/
│   │   │       ├── __init__.py         # APIRouter aggregator for v1
│   │   │       ├── jobs.py             # Job CRUD + JD analysis trigger
│   │   │       ├── candidates.py       # Upload, parse, profile management
│   │   │       ├── ranking.py          # Ranking pipeline trigger + result retrieval
│   │   │       ├── copilot.py          # SSE streaming copilot endpoint
│   │   │       ├── exports.py          # CSV/JSON/PDF export endpoints
│   │   │       └── health.py           # /health + /metrics
│   │   │
│   │   ├── domain/                     # Business logic — NO FastAPI imports here
│   │   │   ├── jobs/
│   │   │   │   ├── models.py           # JobProfile Pydantic domain models
│   │   │   │   ├── service.py          # Job business logic (calls repository + ML)
│   │   │   │   └── repository.py       # All PostgreSQL queries for jobs
│   │   │   ├── candidates/
│   │   │   │   ├── models.py           # CandidateProfile, WorkEntry, etc.
│   │   │   │   ├── service.py          # Candidate business logic
│   │   │   │   └── repository.py       # All PostgreSQL queries for candidates
│   │   │   ├── ranking/
│   │   │   │   ├── models.py           # RankedCandidate, HiringRelevanceScore, Explanation
│   │   │   │   ├── service.py          # Orchestrates the full ranking pipeline
│   │   │   │   └── repository.py       # Rankings, agent_logs persistence
│   │   │   └── copilot/
│   │   │       ├── models.py           # CopilotSession, Message
│   │   │       ├── service.py          # Session management, RAG pipeline
│   │   │       └── repository.py       # Session persistence
│   │   │
│   │   ├── ml/                         # ML modules — pure computation, no HTTP
│   │   │   ├── embedding/
│   │   │   │   ├── bge_m3.py           # BGE-M3 ONNX inference wrapper
│   │   │   │   └── cache.py            # Redis embedding cache (read-through)
│   │   │   ├── extraction/
│   │   │   │   ├── job_intelligence.py # Job LLM extraction agent
│   │   │   │   └── entity_extraction.py# Resume entity extraction agent
│   │   │   ├── scoring/                # ALL pure Python — no LLM
│   │   │   │   ├── career_scorer.py
│   │   │   │   ├── skill_matcher.py
│   │   │   │   ├── project_scorer.py
│   │   │   │   ├── authenticity_scorer.py
│   │   │   │   ├── behavioral_scorer.py
│   │   │   │   └── growth_scorer.py
│   │   │   ├── ranking/
│   │   │   │   ├── contextual_relevance.py # Single LLM agent (query-time)
│   │   │   │   ├── adaptive_ranker.py      # Pure Python weighted sum
│   │   │   │   └── normalizer.py           # Score distribution normalization
│   │   │   ├── explainability/
│   │   │   │   └── explanation_agent.py    # Lazy explanation LLM agent
│   │   │   ├── copilot/
│   │   │   │   ├── rag_pipeline.py         # RAG retrieval + context building
│   │   │   │   └── copilot_agent.py        # LangGraph agent with tools
│   │   │   └── ontology/
│   │   │       ├── skill_graph.py          # NetworkX graph manager
│   │   │       └── skill_taxonomy.yaml     # Curated 500+ skill ontology
│   │   │
│   │   ├── infrastructure/             # External service clients
│   │   │   ├── database.py             # asyncpg pool factory + connection context
│   │   │   ├── redis.py                # aioredis client factory
│   │   │   ├── qdrant.py               # qdrant-client async wrapper
│   │   │   ├── minio.py                # aioboto3 MinIO client
│   │   │   └── llm/
│   │   │       ├── router.py           # Gemini primary + GPT-4 Mini fallback
│   │   │       ├── gemini_client.py    # google-generativeai wrapper
│   │   │       └── rate_limiter.py     # Semaphore + backoff for outbound LLM calls
│   │   │
│   │   ├── parsers/
│   │   │   ├── docling_parser.py
│   │   │   ├── pdfplumber_parser.py
│   │   │   └── pii_stripper.py         # Regex + spaCy NER for PII removal
│   │   │
│   │   └── middleware/
│   │       ├── auth.py                 # JWT validation (RS256 / HS256)
│   │       ├── tenant.py               # Extract tenant_id, set DB RLS context
│   │       ├── rate_limit.py           # Redis token bucket, per-user
│   │       ├── correlation.py          # Inject X-Correlation-ID on every request
│   │       └── logging.py             # structlog request/response logging
│   │
│   ├── workers/
│   │   └── arq_worker.py               # ARQ task definitions for batch processing
│   │
│   ├── migrations/
│   │   └── alembic/                    # Database migration scripts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_career_scorer.py
│   │   │   ├── test_skill_matcher.py
│   │   │   ├── test_adaptive_ranker.py
│   │   │   └── test_pii_stripper.py
│   │   ├── integration/
│   │   │   ├── test_ranking_pipeline.py
│   │   │   └── test_copilot.py
│   │   └── fixtures/
│   │       ├── sample_jds/
│   │       └── sample_resumes/
│   │
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── .env.example
```

**Why this structure:**
- `domain/` is the core. It imports from `ml/` and `infrastructure/` but never from `api/`. This enforces testability — you can test domain logic without HTTP.
- `ml/` is pure Python with no FastAPI or database imports. It can be extracted to a separate service if needed.
- `infrastructure/` contains all external service clients. Switching from asyncpg to psycopg3 requires changing one file.
- `middleware/` handles cross-cutting concerns. Every request gets a correlation ID, rate limit check, and auth validation before hitting a route handler.

---

### 3.3 API Gateway & Service Boundaries

**Single Service (v1):** For hackathon scope, run everything in one FastAPI process. The folder structure is modular enough to extract services later. Do NOT split into microservices prematurely — you'll spend 40% of your time on inter-service communication that adds no value at this scale.

**Service boundary candidates for v2:**
- `ml/embedding` → separate embedding service (GPU-optimized, scales independently)
- `ml/copilot` → separate copilot service (different latency profile, SSE long connections)
- `workers/` → ARQ worker process (already separate)

**Internal dependency flow:**
```
API Routes → Domain Services → ML Modules
                             → Infrastructure Clients
                             → Domain Repositories → Infrastructure (DB/Cache)
```

Routes never call infrastructure directly. Routes never call ML modules directly. This is enforced by code review, not by Python (no circular import check is sufficient).

---

### 3.4 Dependency Injection

All shared resources are created once at startup via FastAPI's `lifespan` context and injected via `Depends()`.

```python
# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.db_pool = await create_db_pool(settings.DATABASE_URL)
    app.state.redis = await create_redis_client(settings.REDIS_URL)
    app.state.qdrant = create_qdrant_client(settings.QDRANT_URL)
    app.state.minio = create_minio_client(settings.MINIO_ENDPOINT)
    app.state.embedding_model = load_bge_m3(settings.BGE_MODEL_PATH)
    app.state.skill_graph = load_skill_graph("ml/ontology/skill_taxonomy.yaml")
    
    yield
    
    # Shutdown (graceful)
    await app.state.db_pool.close()
    await app.state.redis.close()

app = FastAPI(lifespan=lifespan)
```

```python
# api/deps.py
from fastapi import Depends, Request, HTTPException
from app.infrastructure.database import AsyncConnection

async def get_db(request: Request) -> AsyncConnection:
    async with request.app.state.db_pool.acquire() as conn:
        # Set RLS tenant context
        tenant_id = request.state.tenant_id  # set by tenant middleware
        await conn.execute(f"SET app.current_tenant_id = '{tenant_id}'")
        yield conn

async def get_redis(request: Request):
    return request.app.state.redis

async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)):
    # Validate JWT, return UserClaims(user_id, tenant_id, role)
    return validate_jwt(token, settings.JWT_PUBLIC_KEY)
```

**Why this pattern:** Dependencies are testable (swap `get_db` with an in-memory mock). No global singletons. No thread-safety issues. Resource lifecycle is managed by lifespan, not ad-hoc.

---

### 3.5 Authentication & Authorization

**JWT Structure:**
```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "role": "recruiter|admin|viewer",
  "exp": 1735689600,
  "jti": "unique-token-id"
}
```

**Algorithm:** HS256 for development (single secret), RS256 for production (key pair). The env var table in the original docs was wrong — RS256 requires `JWT_PRIVATE_KEY` (PEM) for signing and `JWT_PUBLIC_KEY` for verification.

**Token Refresh:** Access tokens expire in 1 hour. Refresh tokens expire in 7 days, stored in PostgreSQL (`user_refresh_tokens` table) with rotation on use. Revoke by deleting the refresh token row.

**Authorization (RBAC):**
```python
def require_role(*roles: str):
    async def checker(user: UserClaims = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return checker

# Usage
@router.post("/jobs")
async def create_job(
    body: CreateJobRequest,
    user: UserClaims = Depends(require_role("recruiter", "admin")),
    db: AsyncConnection = Depends(get_db),
):
    ...
```

---

### 3.6 Middleware Stack (Ordered)

Middleware executes in registration order. Order matters:

```python
# main.py — middleware registration (bottom = outermost = first to execute)
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS)
app.add_middleware(RateLimitMiddleware)     # After CORS, before auth
app.add_middleware(CorrelationIDMiddleware) # Inject X-Correlation-ID
app.add_middleware(LoggingMiddleware)       # Log request + response with correlation ID
app.add_middleware(TenantMiddleware)        # Extract tenant from JWT claims
```

**Correlation ID Middleware:**
```python
class CorrelationIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid4()))
        request.state.correlation_id = correlation_id
        
        # Bind to structlog context for this request
        with structlog.contextvars.bound_contextvars(
            correlation_id=correlation_id,
            method=request.method,
            path=request.url.path,
        ):
            response = await call_next(request)
            response.headers["X-Correlation-ID"] = correlation_id
            return response
```

**Why this order:** CORS must be outermost to handle preflight requests before auth. Rate limiting before business logic prevents unnecessary processing. Correlation ID before logging so every log line has context.

---

### 3.7 Ranking Pipeline (Revised Orchestration)

```python
# domain/ranking/service.py

async def run_ranking_pipeline(
    job_id: UUID,
    tenant_id: UUID,
    K: int,
    limit: int,
    db: AsyncConnection,
    redis: Redis,
    qdrant: QdrantClient,
    embedding_model: BGE_M3,
) -> RankingResult:
    
    # 1. Check cache
    cache_key = f"rank:job:{job_id}:top{limit}"
    if cached := await redis.get(cache_key):
        return RankingResult.model_validate_json(cached)
    
    # 2. Acquire distributed lock (prevent duplicate concurrent ranking jobs)
    lock_key = f"lock:rank:{job_id}"
    async with redis_lock(redis, lock_key, timeout=120):
        
        # 3. Re-check cache (another worker may have completed while we waited for lock)
        if cached := await redis.get(cache_key):
            return RankingResult.model_validate_json(cached)
        
        # 4. Load job profile
        job = await job_repository.get(db, job_id)
        
        # 5. Semantic retrieval — top-K candidates
        job_embedding = await get_or_compute_job_embedding(job, embedding_model, redis)
        candidate_pool = await qdrant.search("candidate_embeddings", job_embedding, limit=K,
                                              filter={"tenant_id": str(tenant_id)})
        
        # 6. Load candidate profiles from PostgreSQL (batch query)
        candidate_ids = [hit.id for hit in candidate_pool]
        candidates = await candidate_repository.get_batch(db, candidate_ids)
        
        # 7. Run contextual relevance scoring — ONE async batch
        # asyncio.gather() with bounded concurrency (semaphore=20)
        async with asyncio.Semaphore(20) as sem:
            relevance_scores = await asyncio.gather(*[
                contextual_relevance_agent.score(c.anonymized_profile, job.job_profile, sem)
                for c in candidates
            ])
        
        # 8. Compute final HRS (pure Python — <1ms per candidate)
        ranked_candidates = []
        for candidate, hit, relevance in zip(candidates, candidate_pool, relevance_scores):
            ingestion_scores = candidate.cached_scores  # computed at ingestion time
            hrs = adaptive_ranker.compute_hrs(
                semantic_score=hit.score,
                ingestion_scores=ingestion_scores,
                relevance=relevance,
                role_type=job.role_type,
            )
            ranked_candidates.append(RankedCandidate(
                candidate_id=candidate.id,
                rank=0,  # assigned after sort
                final_score=hrs.final_score,
                score_breakdown=hrs.score_breakdown,
                weights_used=hrs.weights_used,
                # explanation=None  — lazy, generated on demand
            ))
        
        # 9. Sort and assign ranks
        ranked_candidates.sort(key=lambda c: c.final_score, reverse=True)
        for i, c in enumerate(ranked_candidates):
            c.rank = i + 1
        
        # 10. Normalize score distribution
        ranked_candidates = normalize_scores(ranked_candidates)
        
        # 11. Persist to PostgreSQL
        result = RankingResult(
            job_id=job_id,
            role_type=job.role_type,
            total_evaluated=len(candidates),
            candidates=ranked_candidates[:limit],
            weights_used=WEIGHT_PROFILES[job.role_type],
            created_at=datetime.utcnow(),
        )
        await ranking_repository.save(db, result)
        
        # 12. Cache result
        await redis.setex(cache_key, 1800, result.model_dump_json())
        
        return result
```

---

### 3.8 Background Workers (ARQ)

ARQ (Async Redis Queue) replaces Celery. It is async-native, uses Redis as the broker (already present), and requires no separate scheduler process.

```python
# workers/arq_worker.py

async def process_resume_upload(ctx: dict, candidate_id: UUID, file_path: str, tenant_id: UUID):
    """
    Background task: Parse, extract, embed, index a single resume.
    Triggered by POST /candidates/upload.
    """
    db = ctx["db_pool"]
    redis = ctx["redis"]
    qdrant = ctx["qdrant"]
    model = ctx["embedding_model"]
    
    # 1. Parse with Docling (fallback pdfplumber)
    parsed = await parse_resume(file_path)
    
    # 2. LLM entity extraction (one call)
    profile = await entity_extraction_agent.extract(parsed.text)
    
    # 3. PII anonymization
    anonymized = pii_stripper.strip(profile)
    
    # 4. Ingestion-time scoring (all pure Python)
    cached_scores = CandidateIngestScores(
        career=career_scorer.score(profile),
        projects=[project_scorer.score(p) for p in profile.projects],
        behavioral=behavioral_scorer.score(profile),
        authenticity=authenticity_scorer.score(profile),
        growth=growth_scorer.score(profile),
    )
    
    # 5. Generate embedding
    embedding_text = build_candidate_embedding_text(profile)
    embedding = await model.embed(embedding_text)
    
    # 6. Persist to PostgreSQL
    await candidate_repository.update(db, candidate_id, {
        "raw_profile": profile.model_dump(),
        "anonymized_profile": anonymized.model_dump(),
        "cached_scores": cached_scores.model_dump(),
        "embedding_id": str(candidate_id),
        "status": "ready",
    })
    
    # 7. Cache embedding
    await redis.setex(f"emb:candidate:{candidate_id}", 604800, embedding.tobytes())
    
    # 8. Upsert to Qdrant
    await qdrant.upsert("candidate_embeddings", points=[{
        "id": str(candidate_id),
        "vector": embedding.tolist(),
        "payload": {
            "candidate_id": str(candidate_id),
            "tenant_id": str(tenant_id),
            "skills": profile.skills_claimed[:30],
            "experience_years": profile.total_experience_months / 12,
            "career_phase": cached_scores.career.career_phase,
        }
    }])

class WorkerSettings:
    functions = [process_resume_upload]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    max_jobs = 10
    job_timeout = 120  # seconds
    keep_result = 86400  # retain job results 24h for status polling
```

---

### 3.9 Error Handling

**Three tiers of errors:**

1. **Validation errors (422):** Pydantic catches at API boundary. Never reach business logic.
2. **Business logic errors (4xx):** Raised explicitly from domain services as typed exceptions.
3. **Infrastructure errors (5xx):** Unexpected failures from DB, Redis, Qdrant. Caught by global exception handler, logged with full context, returned as generic 500.

```python
# Domain exceptions
class NexusException(Exception):
    status_code: int = 500
    
class JobNotFound(NexusException):
    status_code = 404
    
class RankingAlreadyRunning(NexusException):
    status_code = 409
    
class FileTooLarge(NexusException):
    status_code = 413

# Global exception handler
@app.exception_handler(NexusException)
async def nexus_exception_handler(request: Request, exc: NexusException):
    logger.warning("business_error", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": type(exc).__name__, "detail": str(exc), 
                 "correlation_id": request.state.correlation_id}
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_error", exc_info=True, path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "correlation_id": request.state.correlation_id}
    )
```

**Retry Policy (for LLM calls):**
```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    retry=retry_if_exception_type((GeminiRateLimitError, GeminiTimeoutError)),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    stop=stop_after_attempt(3),
)
async def call_gemini_with_retry(prompt: str, schema: type[BaseModel]) -> BaseModel:
    ...
```

---

### 3.10 Logging & Observability

```python
# structlog configuration
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,   # Merge correlation_id, user_id, etc.
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),        # Machine-parseable JSON
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
)
```

**Every LLM call logs:**
```json
{
  "event": "llm_call_complete",
  "agent": "contextual_relevance",
  "model": "gemini-2.5-flash",
  "prompt_tokens": 1247,
  "completion_tokens": 312,
  "latency_ms": 1834,
  "candidate_id": "uuid",
  "job_id": "uuid",
  "correlation_id": "req-uuid",
  "tenant_id": "uuid",
  "timestamp": "2026-01-01T12:00:00Z",
  "input_hash": "sha256...",
  "output_hash": "sha256..."
}
```

**Prometheus metrics (custom):**
```python
ranking_duration = Histogram("nexus_ranking_duration_seconds", "Full ranking pipeline latency", 
                              buckets=[1, 2, 4, 8, 12, 20, 30])
agent_duration = Histogram("nexus_agent_duration_seconds", "Per-agent latency",
                            labelnames=["agent_name"])
llm_tokens_total = Counter("nexus_llm_tokens_total", "LLM tokens consumed",
                            labelnames=["model", "agent"])
embedding_cache_hits = Counter("nexus_embedding_cache_hits_total", "Embedding cache hits",
                               labelnames=["entity_type"])
qdrant_retrieval_duration = Histogram("nexus_qdrant_duration_seconds", "Qdrant search latency")
```

---

### 3.11 Configuration Management

```python
# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    
    # Database
    DATABASE_URL: str
    DB_MIN_POOL_SIZE: int = 5
    DB_MAX_POOL_SIZE: int = 20
    
    # Redis
    REDIS_URL: str
    
    # Qdrant
    QDRANT_URL: str
    QDRANT_API_KEY: str | None = None
    
    # MinIO
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str = "nexus-resumes"
    MINIO_SECURE: bool = False
    
    # LLM
    GEMINI_API_KEY: str
    OPENAI_API_KEY: str | None = None
    LLM_MAX_CONCURRENT: int = 20     # Semaphore on outbound LLM calls
    LLM_TIMEOUT_SECONDS: int = 30
    
    # Auth
    JWT_SECRET: str                   # HS256 dev
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # BGE-M3
    BGE_MODEL_PATH: str = "BAAI/bge-m3"
    BGE_BATCH_SIZE: int = 32
    
    # Feature flags
    EXPLANATION_LAZY: bool = True     # Generate explanations on-demand
    ENABLE_RLS: bool = True           # PostgreSQL Row-Level Security
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"          # "json" | "console"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # ARQ worker
    ARQ_MAX_JOBS: int = 10

settings = Settings()
```

**No secrets in code. No defaults for secrets (fail loudly at startup if missing).**

---

### 3.12 Audit Logging

All ranking decisions require an immutable audit trail for compliance. The `agent_logs` table is write-only from the application (no UPDATE, no DELETE). PostgreSQL trigger fires on any attempted modification and raises an exception.

```sql
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutability
BEFORE UPDATE OR DELETE ON agent_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
```

The `rankings` table records the exact `weights_used` JSONB for reproducibility — any ranking can be reconstructed from stored inputs and weights.

---

## Phase 4 — Docker & Infrastructure

### 4.1 docker-compose.yml (Development)

```yaml
# docker-compose.yml — Development stack
# Run with: docker-compose up -d

name: nexus

x-logging: &default-logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

services:
  # ── Data Layer ──────────────────────────────────────────────────────
  
  postgres:
    image: postgres:16-alpine
    container_name: nexus-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: nexus
      POSTGRES_USER: nexus
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-nexus_dev_password}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nexus -d nexus"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 1g

  qdrant:
    image: qdrant/qdrant:v1.9.0
    container_name: nexus-qdrant
    restart: unless-stopped
    volumes:
      - qdrantdata:/qdrant/storage
    ports:
      - "6333:6333"   # HTTP API
      - "6334:6334"   # gRPC (optional)
    environment:
      QDRANT__LOG_LEVEL: INFO
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/healthz"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 2g

  redis:
    image: redis:7-alpine
    container_name: nexus-redis
    restart: unless-stopped
    command: >
      redis-server
      --maxmemory 1gb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 1.2g

  minio:
    image: minio/minio:RELEASE.2024-01-01T00-00-00Z
    container_name: nexus-minio
    restart: unless-stopped
    command: server /data --console-address ':9001'
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-nexus}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-nexus_dev_secret}
    volumes:
      - miniodata:/data
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Web console
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 15s
      timeout: 5s
      retries: 5
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 512m

  # ── Application Layer ────────────────────────────────────────────────

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: nexus-backend
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URL: postgresql://nexus:${POSTGRES_PASSWORD:-nexus_dev_password}@postgres:5432/nexus
      QDRANT_URL: http://qdrant:6333
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
      MINIO_SECURE: "false"
      LOG_FORMAT: console     # Human-readable in dev
    volumes:
      - ./backend:/app        # Hot reload in dev
      - model-cache:/models   # BGE-M3 model cached between restarts
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      qdrant:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 30s      # BGE-M3 load time
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 4g         # BGE-M3 + asyncio workers + LangGraph

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: nexus-worker
    restart: unless-stopped
    command: python -m arq app.workers.arq_worker.WorkerSettings
    env_file: .env
    environment:
      DATABASE_URL: postgresql://nexus:${POSTGRES_PASSWORD:-nexus_dev_password}@postgres:5432/nexus
      QDRANT_URL: http://qdrant:6333
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
    volumes:
      - ./backend:/app
      - model-cache:/models
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      qdrant:
        condition: service_healthy
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 3g

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: nexus-frontend
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules    # Prevent overwriting node_modules with host mount
    depends_on:
      - backend
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 1g

  # ── Observability Layer ──────────────────────────────────────────────

  prometheus:
    image: prom/prometheus:v2.50.0
    container_name: nexus-prometheus
    restart: unless-stopped
    command:
      - --config.file=/etc/prometheus/prometheus.yml
      - --storage.tsdb.retention.time=7d
    volumes:
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheusdata:/prometheus
    ports:
      - "9090:9090"
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 512m

  grafana:
    image: grafana/grafana:10.3.0
    container_name: nexus-grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_USERS_ALLOW_SIGN_UP: "false"
    volumes:
      - grafanadata:/var/lib/grafana
      - ./infra/grafana/dashboards:/var/lib/grafana/dashboards:ro
      - ./infra/grafana/provisioning:/etc/grafana/provisioning:ro
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    logging: *default-logging
    deploy:
      resources:
        limits:
          memory: 256m

volumes:
  pgdata:
    driver: local
  qdrantdata:
    driver: local
  redisdata:
    driver: local
  miniodata:
    driver: local
  prometheusdata:
    driver: local
  grafanadata:
    driver: local
  model-cache:       # Shared BGE-M3 model between backend and worker
    driver: local

networks:
  default:
    name: nexus-network
    driver: bridge
```

---

### 4.2 Backend Dockerfile (Multi-Stage)

```dockerfile
# backend/Dockerfile
# Multi-stage build: development (hot-reload) and production (minimal image)

# ── Stage 1: Base dependencies ────────────────────────────────────────
FROM python:3.12-slim AS base
WORKDIR /app

# System dependencies for Docling, pdfplumber, BGE-M3 ONNX
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \       # OpenMP for ONNX Runtime
    libglib2.0-0 \   # Required by Docling
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast package management
COPY --from=ghcr.io/astral-sh/uv:0.4.0 /uv /usr/local/bin/uv

COPY pyproject.toml .
RUN uv pip install --system --no-cache -r pyproject.toml

# ── Stage 2: Development ──────────────────────────────────────────────
FROM base AS development
RUN uv pip install --system --no-cache watchfiles  # hot reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", 
     "--reload", "--reload-dir", "/app"]

# ── Stage 3: Production ───────────────────────────────────────────────
FROM base AS production
COPY app/ ./app/

# Bake the BGE-M3 model into the image (avoids download at runtime)
# Option A: Download during build (reproducible, large image ~2GB)
# RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-m3')"
# Option B: Mount model volume (preferred — image stays small)

# Create non-root user
RUN useradd -r -s /bin/false nexus
USER nexus

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000",
     "--workers", "1",          # Single worker — async handles concurrency
     "--timeout-keep-alive", "30"]
```

**Why single uvicorn worker:** The app is async. Multiple uvicorn workers would share the same port but each load BGE-M3 into memory (4×memory overhead). Instead, scale by running multiple container replicas (each with one worker, sharing a model volume mount).

---

### 4.3 Container Architecture Rationale

| Container | Why Isolated | Scaling Strategy |
|---|---|---|
| `postgres` | StatefulSet with data volume; schema migrations must run against exactly one instance. Never co-located with stateless services. | Vertical scale (larger instance). In v2: read replica for analytics queries. |
| `qdrant` | Vector index requires dedicated memory; ANN search is CPU/memory intensive and should not compete with application processing. | Horizontal: 3-node Qdrant cluster with replication factor=2. |
| `redis` | Shared cache/queue; needs fast network access from both backend and worker. Running standalone (not embedded) allows independent restart without cache loss. | Redis Sentinel for HA. Avoid Redis Cluster for this scale. |
| `minio` | Binary file storage; large I/O profile incompatible with API latency requirements. Separate allows different storage mount (fast NVMe for Minio). | MinIO distributed mode (4 nodes) for production. |
| `backend` | Stateless API; can horizontally scale behind a load balancer. | Add replicas behind NGINX upstream. HPA on CPU/memory. |
| `worker` | Separate from API to prevent background task CPU spikes from degrading API latency. Same code, different entrypoint. | Add ARQ worker replicas by increasing `REPLICA_COUNT`. |
| `prometheus` | Pull-based scraping with local TSDB storage. Must be isolated to prevent metric data loss when other services restart. | Single instance for development; Thanos for production HA. |

---

### 4.4 Development vs. Production Differences

```yaml
# docker-compose.prod.yml (overrides, applied with -f docker-compose.yml -f docker-compose.prod.yml)

services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # No default — must be set
    deploy:
      resources:
        limits:
          memory: 4g
          cpus: '2'

  backend:
    build:
      target: production           # Use production stage (no hot-reload)
    volumes: []                    # No source mount in production
    environment:
      LOG_FORMAT: json             # Structured JSON for log aggregation
      ENABLE_RLS: "true"
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 4g
          cpus: '2'
      update_config:
        parallelism: 1             # Rolling update — one container at a time
        delay: 10s
        failure_action: rollback

  worker:
    build:
      target: production
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 3g

  redis:
    command: >
      redis-server
      --maxmemory 4gb
      --maxmemory-policy allkeys-lru
      --requirepass ${REDIS_PASSWORD}
      --save ""                    # Disable persistence in production (use external Redis)
```

---

### 4.5 Health Checks & Startup Order

The `depends_on` with `condition: service_healthy` ensures startup ordering is enforced by health check results, not fixed sleep timers. The `start_period` on the backend (30s) accounts for BGE-M3 model loading before health checks begin. This is correct — do not reduce it without profiling model load time.

**Health endpoint contract:**
```python
@router.get("/health")
async def health_check(
    db: AsyncConnection = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> HealthResponse:
    checks = {
        "database": await check_db(db),
        "redis": await check_redis(redis),
        "qdrant": await check_qdrant(),
        "minio": await check_minio(),
        "embedding_model": check_model_loaded(),
    }
    status = "healthy" if all(v == "ok" for v in checks.values()) else "degraded"
    return HealthResponse(status=status, checks=checks, version=settings.APP_VERSION)
```

Return HTTP 200 even when `status=degraded` — this allows load balancers to keep routing while individual services recover. Only return 503 if the database (the core dependency) is down.

---

## Phase 5 — Staff Engineer Review

### 5.1 Remaining Weaknesses

**W-01: BGE-M3 Cold Start Is a Real Problem**
BGE-M3 takes 15-25 seconds to load at startup. If the backend container restarts (crash, rolling deploy), all incoming requests during model load will fail. The current approach (single backend container) has no mitigation. Fix: pre-load model in a readiness probe, not liveness probe. Use Kubernetes deployment strategy `minReadySeconds=30`. Or pre-bake model into the image (increases image size by ~2GB, eliminates runtime download).

**W-02: asyncio.gather() with 100 LLM Calls Is Optimistic**
100 concurrent Gemini API calls via `asyncio.gather()` with a semaphore of 20 still sends 20 parallel API calls. Gemini Flash has a free-tier limit of 15 RPM and paid tiers around 1000 RPM. If 100 candidates × 2k tokens each = 200k tokens per ranking job, and Gemini Flash's TPM limit is 4M, you're fine on tokens — but RPM limits can bite. Track this carefully in production. The LLM rate limiter (ISSUE-12 fix) is essential.

**W-03: PII Stripping is Regex + spaCy — Incomplete**
Regex patterns for PII stripping are brittle. spaCy NER will miss novel name formats, regional location patterns, and college names that aren't in training data. For production, use a dedicated PII model or service. For hackathon: log false-negative rate and document the limitation. Do not claim "bias-free" without acknowledging this gap.

**W-04: Copilot RAG Over Unindexed Explanations**
The Copilot queries Qdrant for "explanation vectors" — but explanations are generated lazily. If no candidate has been clicked (no explanations generated), the Copilot's RAG retrieval finds nothing and it answers from job profile + ranking table alone. This is not wrong but should be clearly documented as a limitation and surfaced to the user.

**W-05: No Duplicate Candidate Detection Across Tenants**
`file_hash` deduplicates within a tenant (same file, same tenant → skip). But the same candidate could apply to two different tenants. This is fine for data isolation but means BGE-M3 embeddings are computed twice for the same resume. A global embedding cache (keyed by `file_hash`, not `tenant_id + file_hash`) would reduce compute. Minor optimization — acceptable at hackathon scale.

---

### 5.2 Technical Debt

**TD-01: asyncpg Direct SQL Instead of ORM**
The repository pattern with raw asyncpg SQL is correct for performance but creates SQL maintenance burden. Every query is hand-written. Migrations require careful review. Consider `SQLAlchemy 2.0` with `asyncio` mode for v2 — it provides type safety without performance overhead at reasonable scale.

**TD-02: Skill Taxonomy YAML as Source of Truth**
A 500+ skill YAML file maintained by hand is unsustainable past 6 months. In v2: move the skill ontology to a database table with an admin UI for curation. Implement a background job that auto-proposes new skills from incoming resumes and queues them for human review.

**TD-03: LangGraph Version Lock**
LangGraph has broken its API multiple times in minor releases. Pin to an exact version (`langgraph==0.1.X`) and document the exact API surface used. Add a compatibility test in CI that fails if LangGraph behavior changes.

**TD-04: No Migration Rollback Strategy**
Alembic is mentioned but no `downgrade` scripts are specified. For a production system, every migration needs a `downgrade()` implementation. At current scale, just documenting this is sufficient — but it must be addressed before accepting real customer data.

---

### 5.3 Hackathon Compromises (Document and Own Them)

| Compromise | What Was Simplified | Production Fix |
|---|---|---|
| Single-tenant auth | `tenant_id` in JWT works, but no actual tenant signup/billing flow | Full multi-tenant onboarding + Stripe integration in v2 |
| HS256 JWT | Symmetric key signing — single compromised server exposes all tokens | RS256 with key rotation in v2 |
| No message broker | ARQ on Redis for job queue — Redis is not a durable message broker | Kafka or SQS for mission-critical job queue in v2 |
| Single Qdrant node | No replication — if Qdrant crashes, retrieval is down | 3-node Qdrant cluster in v2 |
| BGE-M3 on CPU | Embedding on CPU is ~200ms; GPU would be ~20ms | GPU node for embedding service in v2 |
| Manual bias audit | PII stripping is logged but not automatically verified | Automated PII detection audit pass in v2 |

---

### 5.4 Features That Should Move to V2

1. **Neo4j Knowledge Graph** — Mentioned repeatedly. At current scale, the intelligence it provides (multi-hop candidate-skill-company reasoning) is not justified. The embeddings + ontology graph covers 90% of this. Add Neo4j when you have a working product and recruiter feedback asking for relationship queries.

2. **Recruiter Feedback Loop (thumbs up/down)** — Valuable, but requires data collection infrastructure (feedback storage, label schema, online learning pipeline). Do not ship a broken feedback feature; ship a good ranking feature first.

3. **A/B Testing Framework for Weights** — The adaptive weight configs are a good v1 solution. A/B testing requires a traffic splitting mechanism, a metrics collection pipeline, and statistical significance testing. This is a 1-week project on its own. Deferred to v2.

4. **Custom Role Weight Editor in UI** — The power-user feature. Build only after you've validated that the default weights + 5 presets cover 80% of hiring scenarios through real usage.

5. **Project Embeddings Qdrant Collection** — Removed from v1 (ISSUE-08). Reintroduce in v2 if project-level JD matching is shown to improve ranking quality through evaluation.

6. **LinkedIn OAuth Integration** — This is a data enrichment strategy that requires legal agreements, OAuth app review, and rate limit management. Do not include in v1.

---

### 5.5 Unnecessary Complexity to Remove

1. **LangGraph for the ranking pipeline** — Remove. Replace with `asyncio.gather()`. LangGraph adds 200ms overhead and 3 external library dependencies for something a built-in Python construct handles better.

2. **Celery + Beat** — Remove. ARQ is strictly superior for this workload. Celery's complexity is only justified when you need distributed task routing across heterogeneous workers, which NEXUS does not have.

3. **project_embeddings Qdrant collection** — Remove. Three Qdrant collections, three write paths, three index maintenance concerns for a feature achievable with offline embedding similarity stored in PostgreSQL.

4. **pdfplumber as OCR fallback** — Clarify: pdfplumber does not do OCR. It extracts text from non-scanned PDFs. For truly scanned PDFs (image PDFs), you need `pytesseract` or `EasyOCR`. The original docs conflate these two. For v1, only support digital PDFs + DOCX (no OCR). Document the limitation.

5. **Kubernetes HPA on CPU only** — At a CPU:memory ratio typical for ML workloads, CPU-only HPA will scale too early. Add custom metrics HPA (queue depth via ARQ, ranking job rate) in v2.

---

### 5.6 Revised Architecture Summary (Clean Version)

```
NEXUS v1.0 — Revised Architecture

┌─────────────────────────────────────────────────────────┐
│                    INGESTION PIPELINE                    │
│   (Runs once per resume/JD — results cached forever)    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PDF/DOCX → Docling Parse → Entity Extraction (LLM×1)  │
│           → PII Strip → Career Score (Python)           │
│           → Project Score (Python) → Auth Score (Python)│
│           → Behavioral Score (Python) → Growth (Python) │
│           → BGE-M3 Embed → Qdrant Upsert               │
│           → PostgreSQL Persist (profile + cached scores)│
│                                                         │
│  JD → Job Intelligence (LLM×1) → BGE-M3 Embed          │
│     → Qdrant Upsert → PostgreSQL Persist                │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    RANKING PIPELINE                      │
│      (Triggered per /rank call — cached 30min)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  job_id → Qdrant Top-K (BGE-M3 cosine) → Pool (K=100) │
│         → Load cached ingestion scores (PostgreSQL)     │
│         → asyncio.gather: Contextual Relevance (LLM×K) │
│         → Adaptive Ranking (Python) → Normalize          │
│         → Sort → Persist → Redis Cache                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                  DELIVERY & EXPERIENCE                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  /rank/{id} → Ranked shortlist (no explanations)        │
│  /rank/{id}/candidate/{cid}/explanation                  │
│           → Lazy Explanation (LLM×1, cached 24h)        │
│                                                         │
│  /copilot/chat → LangGraph RAG Agent (SSE streaming)    │
│               → Tools: compare, filter, explain         │
│                                                         │
│  Dashboard: Next.js 14 → Ranking table → Radar chart   │
│           → Career timeline → Explanation panel         │
│           → Copilot sidebar                             │
└─────────────────────────────────────────────────────────┘

LLM Call Budget per ranking job (K=100):
  Ingestion: already paid (1 per resume)
  Ranking:   100 (contextual relevance, async parallel)
  View:      ~5 (explanations, lazy on demand)
  Copilot:   ~3 per session
  ─────────────────────────────────────────────
  Total:     ~108 LLM calls vs 800+ in original
  Cost:      ~$0.015 vs ~$0.12 per ranking job
  Latency:   ~4s P95 vs ~12-15s in original
```

---

### 5.7 Production Readiness Checklist

| Category | Item | Status in v1 | Required for Production |
|---|---|---|---|
| Security | PostgreSQL RLS | Implemented | ✅ |
| Security | RS256 JWT | HS256 only | Upgrade to RS256 |
| Security | PII audit trail | Basic logging | Automated verification |
| Reliability | LLM fallback (GPT-4 Mini) | Planned | Implement and test |
| Reliability | Qdrant replication | Single node | 3-node cluster |
| Reliability | BGE-M3 warm-up | Readiness probe | ✅ |
| Observability | Prometheus metrics | Implemented | ✅ |
| Observability | Distributed tracing | Not implemented | OpenTelemetry |
| Observability | Grafana dashboards | Basic | Add LLM cost dashboard |
| Compliance | GDPR deletion | Implemented | Test cascading cleanup |
| Compliance | Audit log immutability | Implemented | ✅ |
| Performance | Embedding cache | Implemented | ✅ |
| Performance | Ranking cache | Implemented | ✅ |
| Performance | Score distribution calibration | Implemented | ✅ |
| Ops | Rolling deployment | Implemented | ✅ |
| Ops | Database migrations | Alembic | Add downgrade scripts |
| Ops | Secrets management | .env only | Vault / K8s Secrets |

---

*This document was written as a technical critique by a Staff Engineer reviewing a well-intentioned but over-engineered initial design. The product vision is worth building. The engineering decisions needed recalibration. The result is an architecture that is faster, cheaper, and more maintainable while delivering all the same features.*

*NEXUS v2.0 Engineering Architecture — IndiaRuns AI Hiring Intelligence*
