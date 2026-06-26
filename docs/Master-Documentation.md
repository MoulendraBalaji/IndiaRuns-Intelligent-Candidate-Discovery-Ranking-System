 

**◈  CLASSIFIED: AI TALENT INTELLIGENCE PLATFORM  ◈**

**NEXUS**

**AI HIRING INTELLIGENCE PLATFORM**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*Complete Engineering Documentation Suite*

 

● PRD  ● TRS  ● SRS  ● Architecture  ● Database

● API Spec  ● Agent Design  ● Data Flow  ● Folder Structure

● Roadmap  ● Evaluation Metrics  ● PPT Guide  ● GitHub README

● UI/UX Specification  ● Deployment Architecture

 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Hackathon Submission — AI Talent Intelligence Engine**

Version 1.0  |  2026  |  Multi-Agent · Explainable AI · Production Grade

 

**ABOUT THIS DOCUMENT**

**What is NEXUS?**

NEXUS is a production-grade AI Hiring Intelligence Platform that fundamentally reimagines how companies hire. Instead of matching keywords, NEXUS deploys a panel of specialized AI agents — each reasoning like an experienced recruiter, hiring manager, or behavioral psychologist — to holistically evaluate candidates and produce ranked, fully explainable shortlists that hiring teams can trust and act on immediately.

*The platform answers not "who matches the keywords" but "who is the best person to hire, why, with what evidence, and with what confidence."*

**What's in this document?**

This document is a complete engineering documentation suite compiled into a single unified reference. It covers every layer of the NEXUS platform — from product requirements and agent design to database schemas, API specs, deployment architecture, and UI/UX guidelines. It is designed as both a hackathon submission artifact and a production engineering blueprint.

| \# | Section | Purpose | Audience |
| :---- | :---- | :---- | :---- |
| 01 | PRD | Product goals, users, features, success metrics | Product / Stakeholders |
| 02 | TRS | Technology stack decisions with rationale | Tech Leads / Architects |
| 03 | SRS | Functional & non-functional requirements | Engineers / QA |
| 04 | Architecture | System layers, agent orchestration, design decisions | Architects / DevOps |
| 05 | Database Design | PostgreSQL schema, Qdrant collections, Redis keys | Backend Engineers |
| 06 | API Spec | OpenAPI-style endpoint definitions | Backend / Frontend Devs |
| 07 | Agent Design | Per-agent purpose, input, output, prompt strategy | AI / ML Engineers |
| 08 | Data Flow | Sequence diagrams for all major pipelines | All Engineers |
| 09 | Folder Structure | Complete project directory layout | All Engineers |
| 10 | Roadmap | Phased development plan with milestones | PM / Leadership |
| 11 | Evaluation Metrics | How NEXUS measures its own performance | Analysts / ML Engineers |
| 12 | PPT Guide | Slide-by-slide architecture presentation guide | Presenters |
| 13 | GitHub README | Open-source README for the repository | All / Community |
| 14 | UI/UX Spec | Dashboard, copilot, and interaction design | Frontend Devs / Designers |
| 15 | Deployment | Docker, Kubernetes, CI/CD, infra architecture | DevOps / Platform Eng |

 

**◆ NOTE:** *All documents in this suite are interconnected. Cross-references are provided where relevant. When in doubt, refer to the Architecture Document (§04) as the single source of truth for system design.*

**TABLE OF CONTENTS**

 

**01**  Product Requirements Document (PRD)

**02**  Technical Requirements Specification (TRS)

**03**  Software Requirements Specification (SRS)

**04**  System Architecture Document

**05**  Database Design

**06**  API Specification (OpenAPI-Style)

**07**  Agent Design Document

**08**  Data Flow & Sequence Diagrams

**09**  Folder Structure

**10**  Development Roadmap

**11**  Evaluation Metrics

**12**  PPT Architecture Guide

**13**  GitHub README

**14**  UI/UX Specification

**15**  Deployment Architecture

**01 — PRODUCT REQUIREMENTS DOCUMENT (PRD)**

**1.1 Executive Summary**

NEXUS is a production-grade AI Hiring Intelligence Platform that replaces keyword-based Applicant Tracking Systems with a multi-agent AI panel that thinks and reasons like experienced recruiters. The platform evaluates candidates holistically — skill depth, project quality, career trajectory, behavioral signals, and resume authenticity — and produces ranked, explainable shortlists that hiring teams can trust and act on.

*NEXUS answers not "who matches the keywords" but "who is the best person to hire, why, with what evidence, and with what confidence."*

**1.2 Problem Statement**

1. Traditional ATS tools rely on exact keyword matching, rejecting qualified candidates who use synonyms (e.g. "Apache Kafka" vs "Message Queues")  
2. Recruiters spend 60–80% of their time on manual screening that should be automated intelligently  
3. Ranking scores are opaque — recruiters cannot understand why a candidate was ranked higher  
4. Resume inflation is rampant; systems cannot distinguish genuine expertise from keyword stuffing  
5. No existing free tool predicts growth potential or proactively flags hiring risks  
6. Current solutions are not designed for multi-agent, explainable AI reasoning  
7. Bias baked into ranking (name, college prestige, photo) produces discriminatory shortlists

**1.3 Goals & Non-Goals**

**Primary Goal:** Build an AI hiring panel that reasons over candidates the way experienced recruiters do

**Secondary Goal:** Generate ranked, explainable shortlists with skill gaps, hiring risks, and tailored interview questions

**Tertiary Goal:** Demonstrate production readiness: Docker, FastAPI, PostgreSQL, Qdrant, Redis, LangGraph

**Non-Goal (v1):** Full ATS workflow (scheduling, offers, onboarding) — deferred to v2

**Non-Goal (v1):** Real-time crawling of LinkedIn or external platforms — requires OAuth agreements

**Non-Goal (v1):** Mobile application — desktop web dashboard only

**1.4 Target Users**

| User Persona | Role | Primary Need | Pain Point Solved |
| :---- | :---- | :---- | :---- |
| Technical Recruiter | Screening & Shortlisting | Fast, explainable candidate ranking | Manual screening bottleneck |
| Hiring Manager | Technical Evaluation | Deep skill & project quality assessment | Irrelevant candidates passed through |
| HR Business Partner | Workforce Planning | Bias-free, auditable ranking process | Compliance & discrimination risk |
| Talent Analytics Lead | Reporting & Insights | Aggregate hiring intelligence data | No visibility into hiring funnel quality |
| Engineering Director | Strategic Hiring | Growth potential prediction per role | Hiring for today vs building for tomorrow |

 

**1.5 Core Feature Requirements**

8. **F-01: Ingest JDs (text/JSON) and parse into structured Job Intelligence Profile with hidden expectation extraction**  
9. **F-02: Parse resumes (PDF/DOCX) into structured Candidate Knowledge Profiles with entity extraction**  
10. **F-03: Semantic retrieval — top-K candidates via vector similarity (BGE-M3 \+ Qdrant) with metadata filtering**  
11. **F-04: Multi-agent scoring: Recruiter Agent, Hiring Manager Agent, Behavioral Agent (parallel execution)**  
12. **F-05: Skill Intelligence with ontology-based semantic skill graph (Kafka → Message Queues → Streaming)**  
13. **F-06: Project Intelligence — extract problem/architecture/scale/impact from project descriptions**  
14. **F-07: Career Intelligence — trajectory, velocity, tenure stability, and domain progression analysis**  
15. **F-08: Authenticity Verification — evidence-based skill confidence scoring to detect resume inflation**  
16. **F-09: Growth Potential Agent — predict future trajectory from historical signals and learning velocity**  
17. **F-10: Adaptive Ranking — dynamic weight tuning per role type (research / leadership / junior / devops)**  
18. **F-11: Explainability Engine — per-candidate narrative: why selected, gaps, risks, tailored interview questions**  
19. **F-12: Recruiter Copilot — RAG-based streaming chat interface over all ranking outputs**  
20. **F-13: Bias Mitigation — strip PII (name, gender, photo, college name) before ranking pipeline**  
21. **F-14: Dashboard — ranked list with radar charts, career timeline, and skill gap heatmap**  
22. **F-15: Ranked output export (CSV/JSON/PDF) for reporting and submission**

**1.6 Success Metrics**

| Metric | Target | Measurement Method |
| :---- | :---- | :---- |
| Ranking latency (100 candidates) | \< 8 seconds | P95 API response time via Prometheus |
| Semantic retrieval precision@10 | \> 80% | Human evaluator label agreement on 200 JD-candidate pairs |
| Explainability score (user study) | \> 4.0/5.0 | Recruiter comprehension survey post-demo |
| Bias reduction | Name/gender blind ranking | Audit log verification \+ A/B test against named inputs |
| Resume parse accuracy | \> 90% field extraction rate | Manual spot-check on 50 diverse resumes |
| Copilot response relevance | \> 85% relevance score | Recruiter rating on 50 test queries |
| System uptime | \> 99.5% monthly | Uptime monitoring via Prometheus AlertManager |

**02 — TECHNICAL REQUIREMENTS SPECIFICATION (TRS)**

*Every technology choice in NEXUS is deliberate, evaluated against alternatives, and justified by production requirements.*

**2.1 AI & Embedding Layer**

| Component | Choice | Rationale / Why Not Alternative |
| :---- | :---- | :---- |
| Embedding Model | BAAI/BGE-M3 | Multilingual, outperforms Sentence-BERT on MTEB; handles code \+ natural language in resumes; free |
| LLM (Primary) | Gemini 2.5 Flash | Best cost/reasoning ratio; structured JSON output via function calling; fast inference; 1M context |
| LLM (Fallback) | GPT-4.1 Mini | OpenAI function calling reliability; well-documented structured outputs; redundancy |
| Agent Framework | LangGraph | Stateful multi-agent graphs; better than LangChain for agent loops with conditional branching |
| Resume Parser | Docling \+ pdfplumber | Docling handles complex layouts (tables, columns); pdfplumber as OCR fallback for scanned PDFs |

 

**2.2 Data & Storage Layer**

| Component | Choice | Purpose / Rationale |
| :---- | :---- | :---- |
| Vector Database | Qdrant (Docker) | On-premise, fast ANN search; rich metadata filtering; Docker-native; outperforms FAISS at scale with filtering |
| Relational DB | PostgreSQL 16 | Structured candidate profiles, audit logs, job configs, ranking history; JSONB for flexible schema |
| Cache / Queue | Redis 7 | Embedding cache (avoid re-computing), session data, rate limiting, Celery task broker |
| Object Store | MinIO (S3-compatible) | Resume PDF/DOCX binary storage; presigned URL serving; no cloud vendor lock-in |
| Knowledge Graph | Neo4j (v2 roadmap) | Candidate-Skill-Company relationship graph for advanced multi-hop reasoning |

 

**2.3 Backend & API Layer**

| Component | Choice | Notes |
| :---- | :---- | :---- |
| API Framework | FastAPI 0.111+ | Async support; auto OpenAPI docs; Pydantic v2 validation; Python ecosystem compatibility |
| Task Queue | Celery \+ Redis | Async resume processing; parallel agent execution; webhook callbacks; retry on failure |
| Auth | OAuth2 \+ JWT | Recruiter accounts; tenant isolation; token refresh flow; RS256 signing |
| Logging | structlog \+ JSON | Machine-parseable logs; model input/output audit trail; correlation ID per request |
| Monitoring | Prometheus \+ Grafana | Latency, throughput, agent error rates, embedding cache hit rate, per-agent cost tracking |

 

**2.4 Frontend Layer**

| Component | Choice | Notes |
| :---- | :---- | :---- |
| Framework | Next.js 14 (App Router) | SSR for dashboard; client components for chat; optimal for enterprise SaaS; Edge-ready |
| Styling | Tailwind CSS \+ custom tokens | Rapid cosmos-themed dark UI; utility-first with design system tokens |
| Charts | Recharts \+ D3.js | Skill radar charts, career timeline, score breakdown, funnel heatmaps |
| State Management | Zustand \+ React Query | Lightweight global state; server-state caching with auto-invalidation; no Redux overhead |
| Streaming Chat | WebSocket \+ SSE | Recruiter Copilot real-time responses via Server-Sent Events; fallback to polling |

 

**2.5 Performance Requirements**

23. Resume parsing: \< 2 seconds per document (PDF/DOCX under 5MB)  
24. Embedding generation: batch 50 candidates in \< 5 seconds via ONNX-optimized BGE-M3  
25. Qdrant semantic retrieval (top-100 from 10k candidates): \< 200ms P99  
26. Full multi-agent pipeline per candidate: \< 3 seconds (parallelized LangGraph nodes)  
27. Full JD → ranked shortlist (10 candidates): \< 15 seconds end-to-end  
28. Dashboard page load: \< 1.5 seconds (Next.js SSR \+ Redis cache \+ CDN assets)  
29. Recruiter Copilot response: \< 3 seconds to first token (streaming via SSE)

**2.6 Security Requirements**

30. All candidate PII encrypted at rest (AES-256) in PostgreSQL via pgcrypto extension  
31. Tenant isolation: each company's data namespaced in Qdrant collections and PostgreSQL schemas  
32. API key rotation every 30 days; secrets managed via environment variables or Vault — never in code  
33. GDPR compliance: candidate data deletion endpoint with cascading cleanup across all stores  
34. All agent inputs/outputs logged with timestamp, model version, and recruiter ID for full auditability  
35. Bias audit trail: pre-ranking PII strip log, post-ranking identity restore log with verification hash  
36. Rate limiting: 100 requests/minute per recruiter account via Redis token bucket

**03 — SOFTWARE REQUIREMENTS SPECIFICATION (SRS)**

**3.1 Functional Requirements**

**FR-01: Job Ingestion & Intelligence**

37. The system SHALL accept JD input via REST API as raw text or structured JSON  
38. The system SHALL invoke the Job Intelligence Agent to extract: required\_skills, preferred\_skills, experience\_level, industry, soft\_skills, career\_patterns, red\_flags, role\_objectives, hidden\_expectations, seniority\_tier  
39. The system SHALL generate a structured JobProfile object and persist it in PostgreSQL  
40. The system SHALL generate a combined embedding of the JD \+ JobProfile for Qdrant indexing  
41. Job profiles SHALL be versioned; re-analysis SHALL create a new version without overwriting history

**FR-02: Resume Ingestion & Candidate Profiling**

42. The system SHALL accept resume uploads as PDF or DOCX via multipart/form-data  
43. The system SHALL parse resumes using Docling with pdfplumber fallback for scanned documents  
44. The system SHALL extract: contact\_info, skills, work\_history, education, projects, certifications, activity\_signals  
45. The system SHALL build a CandidateProfile JSON and persist it in PostgreSQL  
46. The system SHALL generate a candidate representation embedding and upsert into Qdrant  
47. The system SHALL strip PII (name, photo, college name, address) before passing to ranking agents

**FR-03: Semantic Retrieval**

48. Given a job\_id, the system SHALL query Qdrant for top-K candidates by cosine similarity (default K=100)  
49. K SHALL be configurable per request (range 10–500) via query parameter  
50. The system SHALL apply metadata pre-filters if specified (e.g., min\_experience\_years, required\_location)  
51. Retrieval results SHALL include candidate\_id, similarity\_score, and basic profile metadata

**FR-04: Multi-Agent Scoring**

52. The system SHALL run 3 primary evaluation agents in parallel: Recruiter Agent, Hiring Manager Agent, Behavioral Agent  
53. Each agent SHALL return: score (0–100), justification (list\[str\]), signals\_detected (list\[str\]), risks\_or\_gaps (list\[str\])  
54. The system SHALL also run: Skill Intelligence Agent, Project Intelligence Agent, Career Intelligence Agent, Authenticity Agent, Growth Potential Agent  
55. All agent outputs SHALL be structured via Pydantic models and validated before aggregation  
56. Agent failures SHALL NOT fail the entire pipeline; defaults SHALL be used with a warning flag

**FR-05: Adaptive Ranking & Final Score**

57. The system SHALL compute a Hiring Relevance Score (HRS) using weighted aggregation of all agent outputs  
58. Weights SHALL be dynamically selected based on role\_type (research / leadership / junior / devops / default)  
59. Default: HRS \= 0.30×Semantic \+ 0.25×Recruiter \+ 0.20×HiringManager \+ 0.15×Behavioral \+ 0.10×Growth  
60. The system SHALL sort candidates descending by HRS and return the top-N shortlist (configurable)  
61. Weight configurations SHALL be logged per ranking job for auditability and reproducibility

**FR-06: Explainability**

62. Each ranked candidate SHALL have an Explanation object: overall\_match, confidence\_score, why\_selected, missing\_skills, hiring\_risks, interview\_questions (3–5), upskilling\_recommendation  
63. Explanations SHALL be generated by the Explanation Agent using structured output mode  
64. No recommendation SHALL be surfaced to the UI without an attached explanation  
65. Explanations SHALL reference specific evidence from the candidate's profile (not generic statements)

**FR-07: Recruiter Copilot**

66. The system SHALL expose a /copilot/chat endpoint accepting natural language queries in context of a job\_id  
67. The Copilot SHALL use RAG over: ranking outputs, agent explanations, candidate profiles, job profiles  
68. The Copilot SHALL support: comparison queries, filter queries, follow-up questions, ranking rationale queries  
69. Responses SHALL stream via Server-Sent Events (SSE) with delta tokens

**3.2 Non-Functional Requirements**

| Category | Requirement | Acceptance Criteria |
| :---- | :---- | :---- |
| Availability | System uptime target | 99.5% monthly uptime measured via Prometheus |
| Scalability | Horizontal pod scaling | Kubernetes HPA triggers at 70% CPU or 80% memory |
| Data Retention | Candidate data lifecycle | Auto-purge after 180 days unless actively retained by tenant |
| Accessibility | Frontend WCAG compliance | WCAG 2.1 AA for all dashboard views; keyboard navigable |
| Compatibility | Browser support | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Portability | Container requirements | Full system runnable via docker-compose up with single command in \< 5 minutes |
| Observability | Distributed tracing | OpenTelemetry traces for all agent calls with latency breakdown |
| Auditability | Compliance logging | Immutable audit log for all ranking decisions with recruiter ID and timestamp |

**04 — SYSTEM ARCHITECTURE DOCUMENT**

**4.1 Architecture Philosophy**

NEXUS is designed as a layered, agent-orchestrated intelligence platform. The key architectural insight is that ATS ranking is fundamentally a reasoning problem, not a retrieval problem. Semantic search handles retrieval (finding relevant candidates from a corpus); multi-agent LLM reasoning handles evaluation (deciding who to hire and why). These two concerns are deliberately separated in the architecture, allowing each layer to scale and evolve independently.

**4.2 High-Level Architecture Layers**

| Layer | Components | Responsibility |
| :---- | :---- | :---- |
| L1: Ingestion | Resume Parser (Docling/pdfplumber), JD Parser, MinIO | Convert raw files into structured JSON data |
| L2: Intelligence | Job Agent, Resume Agent, Skill Ontology Graph | Deep semantic understanding of JD and candidate profiles |
| L3: Retrieval | BGE-M3 Embeddings, Qdrant, Embedding Cache (Redis) | Fast vector-based candidate pool construction |
| L4: Evaluation | LangGraph Multi-Agent Panel (8 agents, parallelized) | Per-candidate holistic scoring across all dimensions |
| L5: Ranking | Adaptive Ranking Engine, Explainability Agent | Final scored, ranked, explained shortlist production |
| L6: Delivery | FastAPI, WebSocket/SSE, Recruiter Copilot RAG | API and streaming interfaces for frontend consumption |
| L7: Presentation | Next.js Dashboard, Recharts, Chat UI, Export Module | Recruiter-facing experience and data visualization |
| L8: Operations | Docker Compose / Kubernetes, Postgres, Prometheus, Grafana | Storage, caching, monitoring, CI/CD, deployment |

 

**4.3 Full Pipeline Architecture (ASCII)**

**JD INPUT FLOW:**

  \[Recruiter UI\] ──POST /api/v1/jobs──▶ \[FastAPI Gateway\]

                                               │

                                \[Job Intelligence Agent\]

                                ┌───────────────────────┐

                                │ Required Skills        │

                                │ Hidden Expectations    │

                                │ Seniority / Domain     │

                                │ Red Flags / Culture    │

                                └───────────────────────┘

                                               │

                                     \[JobProfile JSON\]

                                               │

                           ┌───────────────────┴──────────────────┐

                    \[PostgreSQL jobs\]                 \[Qdrant: job\_embeddings\]

 

**RANKING PIPELINE:**

  \[job\_id \+ K\] ──▶ Qdrant Top-K Retrieval ──▶ Candidate Pool (K=100 default)

                                                          │

              ┌───────────────────────────────────────────┤

              │           PARALLEL AGENT NODES            │

              │                                           │

     \[Recruiter Agent\]      \[HM Agent\]      \[Behavioral Agent\]

     \[Skill Agent\]          \[Project Agent\] \[Career Agent\]

     \[Authenticity Agent\]                   \[Growth Agent\]

              │                                           │

              └─────────\[Adaptive Ranking Engine\]─────────┘

                                     │

                           \[Explainability Agent\]

                                     │

                          \[Ranked Shortlist JSON\]

                                     │

               ┌────────────────────┴────────────────────┐

    \[Recruiter Copilot RAG\]                    \[CSV/JSON Export\]

              │

    \[Next.js Dashboard \+ Chat UI\]

 **4.4 LangGraph Agent State Machine**

  StateGraph nodes:

  ├── START

  ├── job\_intelligence\_node       (sequential, runs once per JD at ingestion)

  ├── resume\_intelligence\_node    (parallel: Fan-out per candidate batch)

  ├── skill\_intelligence\_node     (parallel: runs after resume\_intelligence)

  ├── project\_intelligence\_node   (parallel: runs after resume\_intelligence)

  ├── career\_intelligence\_node    (parallel: runs after resume\_intelligence)

  ├── behavioral\_intelligence\_node (parallel: runs after resume\_intelligence)

  ├── authenticity\_node           (parallel: runs after skill\_intelligence)

  ├── growth\_potential\_node       (parallel: depends on career \+ skill \+ behavioral)

  ├── adaptive\_ranking\_node       (sequential: Fan-in, waits for all agents)

  └── explainability\_node         (sequential: post-ranking, per top-N candidates)

  └── END

  State object: NexusRankingState {

    job\_profile: JobProfile

    candidates: List\[CandidateProfile\]

    agent\_outputs: Dict\[str, AgentEvaluation\]

    ranked\_list: List\[RankedCandidate\]

    explanations: Dict\[str, Explanation\]

    error\_flags: List\[str\]

  }

 

**4.5 Design Decisions & Tradeoffs**

| Decision | Choice Made | Alternative Rejected | Reason |
| :---- | :---- | :---- | :---- |
| Agent framework | LangGraph | LangChain Agents / AutoGen | LangGraph supports cyclic state graphs; better conditional branching; predictable execution |
| Vector DB | Qdrant | FAISS / ChromaDB / Pinecone | FAISS has no metadata filtering; ChromaDB lacks production scalability; Qdrant is Docker-native |
| Embeddings | BGE-M3 | OpenAI text-embedding-3-large | BGE-M3 is free, multilingual, better for tech resume domain; no API cost per resume |
| Ranking formula | Adaptive weighted sum | Learning-to-rank ML model | LTR requires labeled training data; weighted sum is auditable and tunable without retraining |
| LLM primary | Gemini 2.5 Flash | GPT-4o only | Cost efficiency; Gemini Flash has lower latency for structured output; 1M context window |
| Resume parsing | Docling \+ pdfplumber | LlamaParse / Unstructured.io | Docling is open-source, handles complex layouts; no API cost per parse; Unstructured.io has pricing |
| Graph store (v2) | Neo4j | Embedded in PostgreSQL JSONB | Neo4j Cypher enables complex multi-hop reasoning; JSONB not designed for graph traversal |

**05 — DATABASE DESIGN**

PostgreSQL 16 is the primary relational store. Qdrant holds all vector embeddings. Redis provides caching and session storage. MinIO persists binary resume files. All stores are Docker-native and production-ready.

**5.1 PostgreSQL Schema**

**Table: tenants**

  tenants

  ├── id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid()

  ├── name            TEXT NOT NULL UNIQUE

  ├── plan            TEXT DEFAULT 'trial'   \-- trial/pro/enterprise

  ├── api\_key\_hash    TEXT                    \-- hashed API key

  ├── created\_at      TIMESTAMPTZ DEFAULT NOW()

  └── updated\_at      TIMESTAMPTZ DEFAULT NOW()

**Table: jobs**

  jobs

  ├── id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid()

  ├── tenant\_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE

  ├── title           TEXT NOT NULL

  ├── raw\_jd          TEXT NOT NULL

  ├── job\_profile     JSONB NOT NULL     \-- structured JobProfile

  ├── role\_type       TEXT DEFAULT 'default'  \-- research/leadership/junior/devops/default

  ├── embedding\_id    TEXT               \-- Qdrant point ID

  ├── version         INT DEFAULT 1      \-- increments on re-analysis

  ├── status          TEXT DEFAULT 'active'  \-- draft/active/archived

  ├── created\_at      TIMESTAMPTZ DEFAULT NOW()

  └── updated\_at      TIMESTAMPTZ DEFAULT NOW()

**Table: candidates**

  candidates

  ├── id                  UUID PRIMARY KEY DEFAULT gen\_random\_uuid()

  ├── tenant\_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE

  ├── raw\_profile         JSONB NOT NULL       \-- full parsed profile (includes PII)

  ├── anonymized\_profile  JSONB NOT NULL       \-- PII-stripped version for agents

  ├── embedding\_id        TEXT                  \-- Qdrant point ID

  ├── skills              TEXT\[\]               \-- flat skill array for quick filtering

  ├── experience\_years    FLOAT

  ├── file\_path           TEXT                  \-- MinIO object path

  ├── file\_hash           TEXT                  \-- SHA256 of original file (dedup)

  ├── created\_at          TIMESTAMPTZ DEFAULT NOW()

  └── updated\_at          TIMESTAMPTZ DEFAULT NOW()

**Table: rankings**

  rankings

  ├── id                  UUID PRIMARY KEY DEFAULT gen\_random\_uuid()

  ├── job\_id              UUID NOT NULL REFERENCES jobs(id)

  ├── candidate\_id        UUID NOT NULL REFERENCES candidates(id)

  ├── final\_score         FLOAT NOT NULL       \-- Hiring Relevance Score (0-100)

  ├── rank\_position       INT NOT NULL         \-- 1-indexed within this job

  ├── semantic\_score      FLOAT

  ├── recruiter\_score     FLOAT

  ├── hm\_score            FLOAT

  ├── behavioral\_score    FLOAT

  ├── growth\_score        FLOAT

  ├── authenticity\_score  FLOAT

  ├── skill\_score         FLOAT

  ├── project\_score       FLOAT

  ├── career\_score        FLOAT

  ├── explanation         JSONB               \-- full Explanation object

  ├── agent\_outputs       JSONB               \-- raw per-agent eval outputs

  ├── role\_weights        JSONB               \-- weight config used for audit

  ├── created\_at          TIMESTAMPTZ DEFAULT NOW()

  └── UNIQUE(job\_id, candidate\_id)

**Table: agent\_logs**

  agent\_logs

  ├── id                UUID PRIMARY KEY DEFAULT gen\_random\_uuid()

  ├── ranking\_id        UUID REFERENCES rankings(id)

  ├── agent\_name        TEXT NOT NULL         \-- e.g. 'skill\_intelligence\_agent'

  ├── model\_name        TEXT NOT NULL         \-- e.g. 'gemini-2.5-flash'

  ├── model\_version     TEXT

  ├── prompt\_tokens     INT

  ├── completion\_tokens INT

  ├── latency\_ms        INT

  ├── input\_hash        TEXT                  \-- SHA256(input) for audit

  ├── output\_hash       TEXT                  \-- SHA256(output) for audit

  ├── error             TEXT                  \-- NULL if success

  └── created\_at        TIMESTAMPTZ DEFAULT NOW()

**Table: copilot\_sessions**

  copilot\_sessions

  ├── id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid()

  ├── job\_id          UUID NOT NULL REFERENCES jobs(id)

  ├── recruiter\_id    UUID NOT NULL            \-- user identity

  ├── messages        JSONB DEFAULT '\[\]'       \-- list of {role, content, ts}

  ├── created\_at      TIMESTAMPTZ DEFAULT NOW()

  └── last\_active\_at  TIMESTAMPTZ DEFAULT NOW()

**5.2 Qdrant Vector Collections**

| Collection | Vector Dim | Payload Fields | Purpose |
| :---- | :---- | :---- | :---- |
| job\_embeddings | 1024 (BGE-M3) | job\_id, tenant\_id, role\_type, title, skills\_required\[\] | JD semantic index for candidate retrieval |
| candidate\_embeddings | 1024 (BGE-M3) | candidate\_id, tenant\_id, skills\[\], exp\_years, domains\[\] | Resume semantic index for top-K retrieval |
| project\_embeddings | 1024 (BGE-M3) | candidate\_id, project\_title, technologies\[\], complexity\_score | Project-level semantic matching to JD responsibilities |

 

**5.3 Redis Key Patterns**

| Key Pattern | TTL | Value / Purpose |
| :---- | :---- | :---- |
| emb:candidate:{id} | 7 days | Serialized float32 BGE-M3 vector — avoids recompute on repeated ranking |
| emb:job:{id} | 2 hours | Serialized float32 BGE-M3 vector — JD embedding cache |
| rank:job:{job\_id}:top{K} | 30 min | JSON of full ranked shortlist — serves dashboard without re-ranking |
| copilot:session:{session\_id} | 2 hours | Conversation history (list of {role, content}) for context window |
| rate:recruiter:{user\_id} | 1 min | Request count (int) for rate limiting — 100 req/min cap |
| lock:rank:{job\_id} | 60 sec | Distributed lock to prevent duplicate concurrent ranking jobs |

**06 — API SPECIFICATION (OpenAPI-Style)**

**6.1 Base URL & Auth**

  Base URL:     https://api.nexus.ai/api/v1

  Auth Header:  Authorization: Bearer \<JWT\>

  Content-Type: application/json  (POST/PUT)

                multipart/form-data  (file uploads)

  Rate Limit:   100 req/min per authenticated recruiter

  Versioning:   URL-based versioning (/api/v1/, /api/v2/)

 

**6.2 Job Endpoints**

**POST /jobs:** Create and analyze a new job description

  Request body:

  { "title": "Senior ML Engineer",

    "raw\_jd": "We are looking for...",

    "role\_type": "research"  // optional: research|leadership|junior|devops|default }

  Response 201:

  { "job\_id": "uuid", "job\_profile": { JobProfile }, "embedding\_id": "qdrant-id",

    "created\_at": "2026-01-01T00:00:00Z" }

  Error 422: Validation error (JD too short \< 50 chars)

  Error 429: Rate limit exceeded

**GET /jobs/{job\_id}:** Retrieve job profile and metadata by ID

**GET /jobs:** List all jobs for tenant (paginated: ?page=1\&limit=20)

**DELETE /jobs/{job\_id}:** Archive a job (soft delete — retained in audit log)

 

**6.3 Candidate Endpoints**

**POST /candidates/upload:** Upload and parse a resume file (PDF/DOCX)

  Request: multipart/form-data

  \- file:      binary (PDF or DOCX, max 10MB)

  \- tenant\_id: string (UUID)

  Response 201:

  { "candidate\_id": "uuid", "parsed\_profile": { CandidateProfile },

    "anonymized\_profile": { PII-stripped }, "embedding\_id": "qdrant-id" }

  Error 415: Unsupported file type

  Error 413: File too large (\> 10MB)

**POST /candidates/batch-upload:** Upload up to 50 resumes as a zip file

**GET /candidates/{id}:** Retrieve candidate profile by ID

**DELETE /candidates/{id}:** GDPR-compliant full deletion across all stores

 

**6.4 Ranking Endpoints**

**POST /rank/{job\_id}:** Trigger full multi-agent ranking pipeline

  Query params:

  \- limit: int  (candidates to return, default 10, max 50\)

  \- K:     int  (semantic pool size, default 100, max 500\)

  Response 200:

  { "job\_id": "uuid", "role\_type": "research",

    "weights\_used": { "w\_semantic": 0.45, "w\_recruiter": 0.20, ... },

    "total\_evaluated": 100,

    "candidates": \[

      { "rank": 1, "candidate\_id": "uuid", "final\_score": 91.4,

        "breakdown": { "semantic": 88.0, "recruiter": 92.0, "hm": 94.0,

                         "behavioral": 85.0, "growth": 90.0, "authenticity": 95.0 },

        "explanation": { "why\_selected": \["5yr NLP prod exp", "RAG at scale"\],

          "missing\_skills": \["Kubernetes", "Go"\],

          "hiring\_risks": \["limited leadership signals"\],

          "interview\_questions": \["Describe your RAG architecture..."\],

          "upskilling\_recommendation": "4 weeks: Docker \+ K8s fundamentals" }

      }

    \] }

**GET /rank/{job\_id}:** Retrieve cached ranking result for a job

**GET /rank/{job\_id}/export?format=csv:** Export ranking as CSV or JSON

 

**6.5 Copilot & Utility Endpoints**

**POST /copilot/chat:** Natural language recruiter copilot (streaming SSE)

  Request:

  { "job\_id": "uuid", "message": "Why is C102 ranked above C089?",

    "session\_id": "optional-for-context" }

  Response: text/event-stream

  data: {"delta": "Candidate C102 ranks higher because..."}

  data: {"delta": "...their RAG implementation at 10M req/day scale..."}

  data: \[DONE\]

**GET /health:** System health check — all service statuses

**GET /metrics:** Prometheus-format metrics endpoint

**07 — AGENT DESIGN DOCUMENT**

*Each agent in NEXUS corresponds to one human hiring question. Every agent is stateless, receives a (candidate\_profile, job\_profile) pair, and returns a typed AgentEvaluation object. Agents are implemented as LangGraph nodes and executed in parallel where possible.*

**Agent 01: Job Intelligence Agent**

| Field | Details |
| :---- | :---- |
| Purpose | Transform raw JD text into a structured, reasoning-ready Job Intelligence Profile |
| Input | raw\_jd: str |
| Output | JobProfile: required\_skills, preferred\_skills, experience\_level, industry, soft\_skills, career\_patterns, red\_flags, role\_objectives, hidden\_expectations, seniority\_tier |
| Model | Gemini 2.5 Flash — function calling / structured JSON output mode |
| Key Innovation | Extracts HIDDEN expectations not written in JD (production ownership, scalability mindset, leadership at scale) |
| Prompt Strategy | Role: Executive Technical Recruiter. Filter corporate fluff. Focus on implicit success criteria and real competencies. |

 

**Agent 02: Resume Intelligence Agent**

| Field | Details |
| :---- | :---- |
| Purpose | Convert raw resume text into structured CandidateProfile with full entity extraction |
| Input | parsed\_resume\_text: str (from Docling/pdfplumber) |
| Output | CandidateProfile: skills\[\], work\_history\[\], education\[\], projects\[\], certifications\[\], activity\_signals, achievements\[\] |
| Model | Gemini 2.5 Flash \+ Docling for layout-aware parsing |
| Key Innovation | Separates layout parsing (Docling) from semantic extraction (LLM) — each does what it does best |
| Prompt Strategy | Role: Technical CV Analyst. Extract with evidence. Flag ambiguous claims for the Authenticity Agent. |

 

**Agent 03: Skill Intelligence Agent**

| Field | Details |
| :---- | :---- |
| Purpose | Understand skills semantically via a domain ontology, not keyword lists |
| Input | candidate\_skills: list\[str\], job\_required\_skills: list\[str\] |
| Output | SkillAnalysis: matched\_skills\[\], semantic\_matches\[\], skill\_gaps\[\], skill\_confidence\_map{skill: 0-1} |
| Key Innovation | Ontology: Kafka → Message Queues → Distributed Systems → Streaming. LangChain → RAG → VectorDB → Qdrant |
| Scoring | Exact match=1.0, semantic parent=0.8, sibling domain=0.6, related=0.4, unrelated=0.0 |
| Ontology Source | Predefined tech skill taxonomy YAML (curated) \+ LLM-generated skill expansion at runtime for unknown skills |

 

**Agent 04: Project Intelligence Agent**

| Field | Details |
| :---- | :---- |
| Purpose | Evaluate projects by depth and relevance, not by count |
| Input | projects: list\[dict\], job\_responsibilities: list\[str\] |
| Output | ProjectAnalysis per project: problem\_solved, architecture\_used, scale, deployment\_status, business\_impact, complexity\_score (0-10), ownership\_level, tech\_stack\[\] |
| Key Innovation | Compares project responsibilities directly to JD responsibilities via embedding similarity (cosine) |
| Prompt Strategy | Role: Senior Engineering Manager. Look for: production scale, real user problem, measurable impact, architectural decisions |
| Differentiator | Academic/tutorial projects penalized (complexity\_score \< 3); production at scale rewarded (complexity\_score 7-10) |

 

**Agent 05: Career Intelligence Agent**

| Field | Details |
| :---- | :---- |
| Purpose | Analyze career trajectory — quality of progression, not just years of experience |
| Input | work\_history: list\[{title, company, start\_date, end\_date, domain, responsibilities}\] |
| Output | CareerAnalysis: progression\_score, tenure\_stability, promotion\_velocity, role\_scope\_expansion, job\_hopping\_risk (0-1), leadership\_growth, domain\_depth\_score |
| Stability Formula | avg\_tenure \>= 24 months → stability=1.0; \< 12 months → 0.3; weighted by recency |
| Key Innovation | Distinguishes strategic career moves (startup to FAANG, domain mastery) from instability using company context |
| Red Flags | ≥2 consecutive roles \< 12 months; declining title seniority; \> 4 domain changes in 5 years |

 

**Agent 06: Behavioral Intelligence Agent**

| Field | Details |
| :---- | :---- |
| Purpose | Estimate hiring intent and cultural engagement from observable behavioral signals |
| Input | activity\_signals: {cert\_recency, github\_last\_active, job\_post\_engagement, profile\_update\_date} |
| Output | BehavioralScore: engagement\_score (0-100), learning\_velocity, community\_presence, hiring\_readiness\_signal |
| Formula | Bs \= 0.5×(Recency Score) \+ 0.5×(Profile Completeness). Active within 7 days → recency=1.0 |
| Key Innovation | Separates passive candidates from active job seekers; adjusts ranking weight for hiring urgency contexts |
| Important | No social media scraping; signals derived only from voluntarily submitted profile data |

 

**Agent 07: Authenticity Verification Agent  ⭐ UNIQUE**

| Field | Details |
| :---- | :---- |
| Purpose | Cross-validate every skill claim against evidence across projects, certs, and activity signals |
| Input | claimed\_skills: list\[str\], projects: list, certifications: list, work\_history: list |
| Output | AuthenticityReport: {skill: {claimed: bool, evidence: list\[str\], confidence: float (0-1)}} for each skill |
| Key Innovation | Does NOT reject claims — reduces confidence. 'Kubernetes: claimed=true, evidence=\[\], confidence=0.2' |
| Verification Logic | Check: Skill appears in ≥1 project description? Matched certification exists? Used in work history? How recent? |
| Business Value | Catches resume inflation without false negatives; gives recruiters calibrated trust signals per skill claim |
| Output example | Python: confidence=0.95 (5 projects, 3 roles). Terraform: confidence=0.2 (listed, no evidence found). |

 

**Agent 08: Growth Potential Agent  ⭐ UNIQUE**

| Field | Details |
| :---- | :---- |
| Purpose | Predict future trajectory from past signals — 'who will become great, not just who is great now' |
| Input | career\_analysis, skill\_analysis, behavioral\_analysis, project\_complexity\_trend (list of scores over time) |
| Output | GrowthScore: growth\_potential (0-100), trajectory\_direction (↑/→/↓), upskilling\_velocity, time\_to\_senior\_estimate\_months |
| Features used | Career progression slope, certs/year, project complexity trend, learning speed indicator, title acceleration |
| Key Innovation | Junior with strong upward trajectory can outrank stagnant senior candidate for growth-oriented roles |
| Formula | GP \= 0.4×(complexity\_trend) \+ 0.3×(cert\_velocity) \+ 0.2×(title\_acceleration) \+ 0.1×(community\_growth) |

 

**Agent 09: Adaptive Ranking Engine**

| Field | Details |
| :---- | :---- |
| Purpose | Combine all agent scores with dynamic role-appropriate weights into a single Hiring Relevance Score |
| Input | All AgentEvaluation objects \+ role\_type enum |
| Output | HiringRelevanceScore (0-100) \+ weight\_config\_used (dict for audit) |
| Default Weights | Semantic: 0.30 | Recruiter: 0.25 | HiringManager: 0.20 | Behavioral: 0.15 | Growth: 0.10 |
| Research Role | Semantic: 0.45 | HM: 0.25 | Recruiter: 0.20 | Behavioral: 0.05 | Growth: 0.05 |
| Leadership Role | Career: 0.35 | HM: 0.30 | Recruiter: 0.20 | Behavioral: 0.10 | Growth: 0.05 |
| Junior Role | Growth: 0.30 | Skill: 0.25 | Project: 0.20 | Recruiter: 0.15 | Career: 0.10 |
| Auditability | Every ranking logs the exact weight config used — reproducible at any time |

 

**Agent 10: Explainability Agent**

| Field | Details |
| :---- | :---- |
| Purpose | Generate human-readable explanations grounded in evidence for each ranked candidate |
| Input | ranked\_candidate \+ all agent outputs \+ job\_profile \+ candidate anonymized\_profile |
| Output | Explanation: {overall\_match, confidence\_score, why\_selected\[\], missing\_skills\[\], hiring\_risks\[\], interview\_questions\[3-5\], upskilling\_recommendation} |
| Model | Gemini 2.5 Flash — chain-of-thought prompting with structured output |
| Quality bar | Every 'why\_selected' point must reference specific evidence from candidate profile (no generic claims) |
| Interview Qs | Tailored to detected skill gaps and hiring risks — not generic behavioral questions |

**08 — DATA FLOW & SEQUENCE DIAGRAMS**

**8.1 Resume Upload Flow**

  Recruiter ──\[POST /candidates/upload\]──▶ FastAPI

                                              │

                                    \[File size/type check\]

                                              │

                                    \[Save to MinIO: resumes/{tenant}/{id}.pdf\]

                                              │

                                    \[Docling.parse(file)\]

                                              │ (fallback: pdfplumber if Docling fails)

                                    \[Resume Intelligence Agent\]

                                              │

                              ┌───────────────┴──────────────────┐

                    \[PII Strip (anonymize)\]           \[BGE-M3 Embed (batch)\]

                              │                                   │

                    \[PostgreSQL: candidates\]          \[Redis: emb:candidate:{id}\]

                              │                                   │

                              └────────────────┬─────────────────┘

                                               │

                                 \[Qdrant upsert: candidate\_embeddings\]

                                               │

                                 \[Response 201: candidate\_id \+ profile\]

 

**8.2 Ranking Pipeline Sequence**

  Recruiter ──\[POST /rank/{job\_id}?K=100\&limit=10\]──▶ FastAPI

                                                           │

                                               \[Check Redis: rank:job:{id}:top10\]

                                               │ (cache hit → return immediately)

                                               │ (cache miss → continue)

                                               ▼

                                    \[Qdrant: top-K cosine search\]

                                               │

                                    \[Candidate Pool: K=100 candidates\]

                                               │

              ┌────────────────────────────────┼────────────────────────────────┐

              │           LANGGRAPH PARALLEL EXECUTION (per candidate)           │

     \[Skill Agent\]  \[Project Agent\]  \[Career Agent\]  \[Behavioral\]  \[Growth\]     │

     \[Recruiter Agent\]               \[HM Agent\]      \[Authenticity Agent\]       │

              │                                                                  │

              └────────────────────────────────┬────────────────────────────────┘

                                               │ (fan-in after all agents complete)

                                    \[Adaptive Ranking Engine\]

                                               │

                                    \[Sort by HRS descending\]

                                               │

                                    \[Explainability Agent: top-N\]

                                               │

                           ┌───────────────────┴──────────────────┐

                  \[PostgreSQL: persist rankings\]       \[Redis: cache ranked list\]

                                               │

                                    \[Response 200: ranked shortlist\]

 

**8.3 Recruiter Copilot Flow**

  Recruiter ──\[POST /copilot/chat\]──▶ FastAPI

                     {job\_id, message, session\_id}

                                          │

                            \[Load session context from Redis\]

                                          │

                            \[RAG Retrieval over Qdrant:\]

                            │  \- Rank explanation vectors

                            │  \- Candidate profile vectors

                            │  \- Job profile vectors

                                          │

                            \[Build context window: session \+ retrieved chunks\]

                                          │

                            \[Gemini 2.5 Flash: stream response\]

                                          │

                            \[SSE stream ──▶ Recruiter browser\]

                                          │

                            \[Append to session history in Redis\]

 

**8.4 Data Ownership Map**

| Data Entity | Primary Store | Cache | Binary Store | Vector Store |
| :---- | :---- | :---- | :---- | :---- |
| Resume File | — | — | MinIO | — |
| Candidate Profile | PostgreSQL | Redis (session) | — | Qdrant |
| Job Description | PostgreSQL | Redis (embedding) | — | Qdrant |
| Ranking Result | PostgreSQL | Redis (30 min) | — | — |
| Agent Logs | PostgreSQL | — | — | — |
| Copilot Session | Redis (2hr TTL) | — | — | — |
| Embeddings | Qdrant | Redis (7 days) | — | — |

**09 — FOLDER STRUCTURE**

*Complete project directory layout for the NEXUS monorepo, organized by concern.*

  nexus/

  ├── backend/                         \# FastAPI Python backend

  │   ├── app/

  │   │   ├── main.py                  \# FastAPI app entrypoint

  │   │   ├── config.py                \# Env config (pydantic-settings)

  │   │   ├── api/

  │   │   │   ├── v1/

  │   │   │   │   ├── jobs.py          \# Job endpoints

  │   │   │   │   ├── candidates.py    \# Candidate upload endpoints

  │   │   │   │   ├── ranking.py       \# Ranking trigger endpoints

  │   │   │   │   ├── copilot.py       \# Recruiter copilot SSE endpoint

  │   │   │   │   └── health.py        \# Health \+ metrics endpoints

  │   │   ├── agents/

  │   │   │   ├── base.py              \# Base agent class \+ AgentEvaluation model

  │   │   │   ├── job\_intelligence.py  \# Agent 01: Job Intelligence

  │   │   │   ├── resume\_intelligence.py  \# Agent 02: Resume Intelligence

  │   │   │   ├── skill\_intelligence.py   \# Agent 03: Skill Intelligence

  │   │   │   ├── project\_intelligence.py \# Agent 04: Project Intelligence

  │   │   │   ├── career\_intelligence.py  \# Agent 05: Career Intelligence

  │   │   │   ├── behavioral\_intelligence.py  \# Agent 06: Behavioral

  │   │   │   ├── authenticity.py      \# Agent 07: Authenticity Verification

  │   │   │   ├── growth\_potential.py  \# Agent 08: Growth Potential

  │   │   │   ├── ranking\_engine.py    \# Agent 09: Adaptive Ranking

  │   │   │   └── explainability.py    \# Agent 10: Explainability

  │   │   ├── core/

  │   │   │   ├── embedding.py         \# BGE-M3 embedding generation (ONNX)

  │   │   │   ├── qdrant\_client.py     \# Qdrant vector DB client

  │   │   │   ├── redis\_client.py      \# Redis cache client

  │   │   │   ├── postgres.py          \# PostgreSQL async client (asyncpg)

  │   │   │   ├── minio\_client.py      \# MinIO object storage client

  │   │   │   └── llm\_router.py        \# Gemini/GPT-4 router with fallback

  │   │   ├── parsers/

  │   │   │   ├── docling\_parser.py    \# Docling PDF/DOCX parser

  │   │   │   ├── pdfplumber\_parser.py \# Fallback OCR parser

  │   │   │   └── pii\_stripper.py      \# PII removal \+ anonymization

  │   │   ├── models/

  │   │   │   ├── job.py               \# JobProfile Pydantic models

  │   │   │   ├── candidate.py         \# CandidateProfile Pydantic models

  │   │   │   ├── ranking.py           \# RankedCandidate, HRS, Explanation

  │   │   │   └── agent.py             \# AgentEvaluation, SkillAnalysis, etc.

  │   │   ├── pipelines/

  │   │   │   ├── ranking\_pipeline.py  \# LangGraph StateGraph orchestrator

  │   │   │   └── copilot\_pipeline.py  \# RAG pipeline for copilot

  │   │   ├── ontology/

  │   │   │   └── skill\_taxonomy.yaml  \# Curated tech skill ontology graph

  │   │   └── middleware/

  │   │       ├── auth.py              \# JWT validation middleware

  │   │       ├── rate\_limit.py        \# Redis-based rate limiting

  │   │       └── logging.py           \# structlog request/response logging

  │   ├── tests/

  │   │   ├── unit/                    \# Unit tests per agent

  │   │   ├── integration/             \# End-to-end pipeline tests

  │   │   └── fixtures/                \# Sample JDs and resumes for testing

  │   ├── Dockerfile

  │   ├── requirements.txt

  │   └── pyproject.toml

  │

  ├── frontend/                        \# Next.js 14 App Router

  │   ├── app/

  │   │   ├── layout.tsx               \# Root layout (cosmic dark theme)

  │   │   ├── page.tsx                 \# Landing page / dashboard

  │   │   ├── jobs/

  │   │   │   ├── page.tsx             \# Job listing page

  │   │   │   └── \[id\]/page.tsx        \# Job detail \+ candidate ranking

  │   │   ├── candidates/page.tsx      \# Candidate management

  │   │   └── copilot/page.tsx         \# Recruiter Copilot chat interface

  │   ├── components/

  │   │   ├── RankingTable.tsx         \# Main ranked candidate table

  │   │   ├── SkillRadarChart.tsx      \# Recharts radar chart

  │   │   ├── CareerTimeline.tsx       \# D3 career progression timeline

  │   │   ├── ExplanationCard.tsx      \# Per-candidate explanation panel

  │   │   ├── CopilotChat.tsx          \# SSE streaming chat component

  │   │   └── ScoreBreakdown.tsx       \# Multi-axis score bar chart

  │   ├── Dockerfile

  │   └── package.json

  │

  ├── infra/

  │   ├── docker-compose.yml           \# Full local stack

  │   ├── docker-compose.prod.yml      \# Production overrides

  │   ├── k8s/

  │   │   ├── backend-deployment.yaml

  │   │   ├── frontend-deployment.yaml

  │   │   ├── postgres-statefulset.yaml

  │   │   ├── qdrant-statefulset.yaml

  │   │   ├── redis-deployment.yaml

  │   │   └── ingress.yaml

  │   └── terraform/                   \# Optional: cloud provisioning

  │

  ├── scripts/

  │   ├── seed\_demo\_data.py            \# Seed 50 demo candidates \+ 5 JDs

  │   ├── eval\_ranking.py              \# Precision@K evaluation script

  │   └── generate\_docs.py             \# Auto-regenerate this document

  │

  ├── docs/                            \# Static documentation assets

  ├── .github/workflows/ci.yml         \# GitHub Actions CI/CD pipeline

  ├── .env.example                     \# Environment variable template

  ├── docker-compose.yml               \# Root-level convenience compose

  ├── Makefile                         \# make dev / make test / make deploy

  └── README.md                        \# GitHub README (see §13)

**10 — DEVELOPMENT ROADMAP**

**Phase 0: Foundation (Days 1–2)**

70. **Set up Docker Compose: PostgreSQL, Qdrant, Redis, MinIO — all services up in one command**  
71. FastAPI skeleton with health endpoint, JWT auth middleware, rate limiting  
72. Resume upload endpoint: Docling parse → PII strip → PostgreSQL persist → Qdrant upsert  
73. BGE-M3 embedding pipeline with Redis caching — confirm \< 2s per resume  
74. JD ingestion endpoint with basic Job Intelligence Agent (Gemini 2.5 Flash structured output)  
75. Seed database with 50 mock candidates and 5 job descriptions for development

**Phase 1: Core Intelligence (Days 3–5)**

76. **Implement all 8 specialized agents with Pydantic output validation**  
77. Build skill ontology YAML with 500+ tech skills and semantic relationships  
78. LangGraph StateGraph: wire all agents with parallel Fan-out and Fan-in aggregation  
79. Adaptive Ranking Engine with all 5 role-type weight configurations  
80. Explainability Agent generating evidence-based narratives and tailored interview questions  
81. POST /rank/{job\_id} returning full ranked shortlist with breakdowns and explanations  
82. Write unit tests for each agent with 5 mock candidate fixtures

**Phase 2: Recruiter Experience (Days 6–8)**

83. **Next.js 14 frontend: cosmic dark theme, Tailwind tokens, layout components**  
84. Job management page: create JD, view parsed job profile, trigger ranking  
85. Ranking dashboard: sortable table, score breakdown bars, explanation modal  
86. Skill radar chart (Recharts), career timeline (D3), skill gap heatmap  
87. Recruiter Copilot: RAG pipeline \+ SSE streaming chat UI  
88. CSV/JSON export functionality for ranking results  
89. Batch resume upload (zip file → process 50 resumes in background via Celery)

**Phase 3: Polish & Production (Days 9–10)**

90. **End-to-end integration tests: upload 20 resumes → rank → verify explanations**  
91. Prometheus metrics \+ Grafana dashboard for latency, throughput, agent costs  
92. structlog audit logging for all ranking decisions with correlation IDs  
93. Performance optimization: confirm P95 ranking latency \< 8s for 10 candidates  
94. GDPR deletion endpoint testing: verify cascading cleanup across all stores  
95. Documentation finalization: README, API docs, deployment guide  
96. Docker multi-stage build optimization for production image size

**V2 Roadmap (Post-Hackathon)**

| Feature | Priority | Estimated Effort | Business Value |
| :---- | :---- | :---- | :---- |
| Neo4j skill-company knowledge graph | High | 2 weeks | Multi-hop reasoning: 'candidates who worked at X with skill Y' |
| LinkedIn OAuth integration (voluntary) | High | 1 week | Richer behavioral signals from profile activity |
| Recruiter feedback loop (thumbs up/down) | High | 1 week | Online learning to improve ranking weights per company |
| A/B testing framework for weight configs | Medium | 1 week | Data-driven weight optimization per role type |
| Multi-language resume support (Docling) | Medium | 3 days | Global talent pool expansion |
| Interview scheduling integration (Calendly) | Low | 1 week | Full ATS workflow completion |
| Slack/Teams notifications on top-candidate alerts | Low | 3 days | Recruiter workflow integration |
| Custom role weight editor in UI | Medium | 3 days | Self-serve weight customization for power users |

**11 — EVALUATION METRICS**

NEXUS is measured across four dimensions: Retrieval Quality, Ranking Quality, Explainability Quality, and System Performance. All metrics are automated where possible and validated with human evaluators.

**11.1 Retrieval Quality (Qdrant / BGE-M3)**

| Metric | Formula | Target | Measurement |
| :---- | :---- | :---- | :---- |
| Precision@K | Relevant in top-K / K | \> 80% @ K=10 | 200 human-labeled JD-candidate pairs |
| Recall@K | Relevant in top-K / Total relevant | \> 75% @ K=10 | Same labeled dataset |
| NDCG@K | Normalized Discounted Cumulative Gain | \> 0.75 | Graded relevance labels (0/1/2) |
| Embedding cache hit rate | Cache hits / Total embed calls | \> 60% after 24h | Redis MONITOR stats |
| Embedding latency | P95 time to generate 1 embedding | \< 200ms CPU, \< 50ms GPU | Prometheus histogram |

 

**11.2 Ranking Quality**

| Metric | Formula | Target | Notes |
| :---- | :---- | :---- | :---- |
| Spearman's ρ | Correlation between NEXUS rank and expert rank | \> 0.75 | Evaluated by 3 senior recruiters on 20 JD-candidate sets |
| Rank Concordance (C-index) | Pairwise agreement with human ranking | \> 0.80 | Robust to ties in scoring |
| Top-3 agreement | % of top-3 matches with human expert panel | \> 70% | High-value metric for practical use |
| False positive rate | Non-relevant in top-10 / 10 | \< 20% | Measured on labeled eval set |
| Score calibration | Distribution of HRS scores (should not cluster) | Std dev \> 10 points | Avoid all candidates scoring 80-82 |

 

**11.3 Explainability Quality**

| Metric | Target | Measurement Method |
| :---- | :---- | :---- |
| Recruiter comprehension score | \> 4.0/5.0 | Likert survey: 'I understand why this candidate was ranked here' |
| Evidence specificity score | \> 4.0/5.0 | Likert: 'The explanation references specific evidence from the resume' |
| Interview question relevance | \> 80% rated as useful | Recruiter panel rating on 50 generated interview questions |
| Upskilling recommendation accuracy | \> 75% match to identified gaps | Expert comparison: rec vs actual gap analysis |
| Hallucination rate in explanations | \< 2% fabricated claims | Manual audit of 100 explanations for factual grounding |

 

**11.4 System Performance Metrics**

| Metric | Target | Alert Threshold | Prometheus Metric Name |
| :---- | :---- | :---- | :---- |
| Full ranking latency P95 (10 candidates) | \< 8 seconds | \> 12s triggers PagerDuty | nexus\_ranking\_duration\_seconds |
| Resume parse latency P99 | \< 3 seconds | \> 5s triggers alert | nexus\_parse\_duration\_seconds |
| Agent execution latency P95 (per agent) | \< 2.5 seconds | \> 4s triggers alert | nexus\_agent\_duration\_seconds{agent=...} |
| Qdrant retrieval latency P99 | \< 300ms | \> 500ms triggers alert | nexus\_qdrant\_duration\_seconds |
| API error rate (5xx) | \< 0.5% | \> 1% triggers alert | nexus\_http\_requests\_total{status='5xx'} |
| LLM token cost per ranking job | \< $0.05 per 10 candidates | Tracked for budget control | nexus\_llm\_tokens\_total{model=...} |

**12 — PPT ARCHITECTURE GUIDE**

*Slide-by-slide guide for presenting NEXUS architecture in a 10–15 minute hackathon demo. Each slide description includes recommended visuals and talking points.*

**Slide 1: Title Slide**

97. Content: NEXUS logo, tagline: 'AI Hiring Intelligence — Beyond Keywords'  
98. Visual: Cosmic dark background, constellation-style neural network animation  
99. *Talking point: 'In 10 minutes, we will show you that hiring can be as intelligent as the humans doing it — or better.'*

**Slide 2: The Problem (Pain Quantification)**

100. Content: 3 stats — 60% recruiter time on screening / 75% qualified candidates rejected by ATS / 0 explainability in current tools  
101. Visual: Split-screen: broken ATS keyword matcher vs NEXUS reasoning agent  
102. *Talking point: 'Every ATS ranks based on who wrote the best keyword list, not who is the best hire.'*

**Slide 3: Solution Overview**

103. Content: NEXUS \= Semantic Retrieval \+ Multi-Agent Reasoning \+ Explainability  
104. Visual: 3-layer diagram — Retrieval Layer → Agent Panel → Explanation Layer  
105. *Talking point: 'We separated retrieval from reasoning. Qdrant finds candidates. 8 AI agents evaluate them. The explanation agent tells you why.'*

**Slide 4: System Architecture**

106. Content: Full L1–L8 architecture diagram (from §4.2) with color-coded layers  
107. Visual: Layered architecture diagram with tech logos (FastAPI, Qdrant, LangGraph, Gemini, Next.js)  
108. *Talking point: Walk each layer in 30 seconds. Emphasize: 'Every component is production-ready and runs locally with one command.'*

**Slide 5: The 8 AI Agents**

109. Content: Agent panel with icons — Skill, Project, Career, Behavioral, Authenticity ⭐, Growth ⭐, Ranking, Explainability  
110. Visual: LangGraph state machine diagram with parallel branches and fan-in  
111. *Talking point: 'Authenticity and Growth Potential are our key innovations — no other platform predicts who will become great.'*

**Slide 6: Live Demo — JD Input**

112. Content: Screen recording — paste a real JD, show JobProfile JSON output  
113. *Talking point: 'Notice how the agent extracted hidden expectations — production ownership, scale mindset — that were never explicitly written in the JD.'*

**Slide 7: Live Demo — Ranking Output**

114. Content: Screen recording — 20 resumes uploaded, /rank called, results in 6 seconds  
115. Visual: Dashboard with ranked table, score breakdown bars, explanation panel open  
116. *Talking point: 'Candidate 3 is ranked first. Not because they have the most keywords — but because their RAG project shows production-scale AI experience and their career shows a 40% year-on-year complexity growth.'*

**Slide 8: Recruiter Copilot Demo**

117. Content: Screen recording — type 'Why is candidate 3 ranked above candidate 7?' and show SSE streaming response  
118. *Talking point: 'Recruiters can interrogate the ranking in natural language. This is not a chatbot — it is a reasoning interface over structured evidence.'*

**Slide 9: Key Differentiators**

| Feature | NEXUS | Traditional ATS | LLM-based Tools |
| :---- | :---- | :---- | :---- |
| Skill matching | Semantic ontology | Exact keyword | Approximate |
| Explainability | Evidence-based narrative | None | Generic summary |
| Authenticity check | Evidence cross-validation | None | None |
| Growth prediction | ML signal model | None | None |
| Bias mitigation | PII strip \+ audit log | None | Varies |

 

**Slide 10: Closing & Metrics**

119. Content: Key numbers — \< 8s ranking / \> 80% precision@10 / \> 4/5 explainability score / 100% explainable  
120. Visual: Cosmos dark background with metric cards glowing in cyan and gold  
121. *Talking point: 'NEXUS is not a demo. It is a production architecture. One docker-compose up. Full pipeline running in under 5 minutes.'*

**13 — GITHUB README**

**◆ NOTE:** *This section contains the full content of the README.md file for the NEXUS GitHub repository.*

 

  \# 🌌 NEXUS — AI Hiring Intelligence Platform

  \> Beyond keywords. Beyond resumes. Into reasoning.

  NEXUS replaces broken keyword-matching ATS with a panel of 8 specialized AI agents

  that evaluate candidates like experienced recruiters — and explain every decision.

  \[\!\[FastAPI\](https://img.shields.io/badge/FastAPI-0.111-00C9E0)\](https://fastapi.tiangolo.com)

  \[\!\[LangGraph\](https://img.shields.io/badge/LangGraph-0.1-7C4DFF)\](https://langchain.com)

  \[\!\[Qdrant\](https://img.shields.io/badge/Qdrant-1.9-F39C12)\](https://qdrant.tech)

  \[\!\[License: MIT\](https://img.shields.io/badge/License-MIT-green)\](LICENSE)

  \#\# 🚀 Quick Start

  \`\`\`bash

  git clone https://github.com/your-org/nexus

  cd nexus

  cp .env.example .env  \# Add your Gemini API key

  docker-compose up \-d  \# Starts all services

  \# Backend: http://localhost:8000/docs

  \# Frontend: http://localhost:3000

  \# Grafana:  http://localhost:3001

  \`\`\`

  \#\# 🧠 The Problem

  Traditional ATS: Kafka expert rejected because they wrote 'Message Queues'.

  NEXUS: Kafka → Message Queues → Distributed Systems → Streaming. MATCH.

  \#\# 🤖 The 8-Agent Panel

  | Agent | Question | Innovation |

  |-------|----------|------------|

  | Skill Intelligence | Do skills truly match? | Ontology-based semantic graph |

  | Project Intelligence | Are projects real and relevant? | Complexity \+ impact scoring |

  | Career Intelligence | Is the trajectory growing? | Velocity & stability analysis |

  | Behavioral Intelligence | Are they actively seeking? | Signal-based engagement |

  | Authenticity ⭐ | Are skill claims evidenced? | Cross-validation, no false rejections |

  | Growth Potential ⭐ | Who will become great? | Forward trajectory prediction |

  | Adaptive Ranking | Final HRS score | Role-aware dynamic weights |

  | Explainability | Why this candidate? | Evidence-grounded narrative |

  \#\# 📊 Architecture

  Ingest → Embed (BGE-M3) → Retrieve (Qdrant) → Evaluate (LangGraph × 8 agents)

  → Rank (HRS) → Explain → Copilot (RAG \+ SSE)

  \#\# ⚡ Performance

  \- Resume parse: \< 2s | Embedding: \< 200ms | Retrieval: \< 200ms

  \- Full ranking (10 candidates): \< 8s P95

  \- All services: docker-compose up in \< 5 minutes

  \#\# 🛠️ Tech Stack

  Backend: Python · FastAPI · LangGraph · BGE-M3 · Gemini 2.5 Flash

  Storage: PostgreSQL · Qdrant · Redis · MinIO

  Frontend: Next.js 14 · Recharts · D3 · Tailwind CSS

  Infra: Docker · Kubernetes · Prometheus · Grafana

  \#\# 📄 License

  MIT — Built for the AI Hiring Intelligence Hackathon 2026

**14 — UI/UX SPECIFICATION**

*NEXUS uses a Cosmos Dark design language: deep space backgrounds, neon accents, glassmorphism panels, and aurora-inspired gradients. The design should feel like mission control for talent intelligence.*

**14.1 Design System**

| Token | Value | Usage |
| :---- | :---- | :---- |
| \--color-bg-primary | \#0A0E27 | Page backgrounds, main canvas |
| \--color-bg-surface | \#0F1A3A | Cards, panels, modal backgrounds |
| \--color-bg-elevated | \#111E3F | Table rows, elevated components |
| \--color-accent-cyan | \#00C9E0 | Primary headings, key metrics, CTAs |
| \--color-accent-purple | \#7C4DFF | Secondary headings, agent badges |
| \--color-accent-gold | \#F39C12 | Highlights, warnings, star ratings |
| \--color-text-primary | \#E8EAF6 | Primary body text |
| \--color-text-secondary | \#B0BEC5 | Captions, metadata, labels |
| \--font-primary | Inter, Calibri, system-ui | All UI text |
| \--font-mono | JetBrains Mono, Courier New | Code blocks, scores, IDs |
| \--radius-card | 12px | Card border radius |
| \--shadow-glow-cyan | 0 0 20px rgba(0,201,224,0.25) | Focused element glow |

 

**14.2 Page Specifications**

**Page: Job List (/jobs)**

122. Header: NEXUS wordmark \+ nav (Jobs | Candidates | Copilot | Settings)  
123. Hero: 'Active Positions' count card with glow border \+ 'New Job' CTA button (cyan)  
124. Job cards: Title, role\_type badge (color-coded), candidate count, status, 'Rank Candidates' CTA  
125. Sort/filter: by role\_type, status, created\_date — no page reload (React Query)

**Page: Ranking Dashboard (/jobs/\[id\])**

126. Job profile summary card: role title, key skills, seniority, hidden expectations panel  
127. 'Run Ranking' button → loading state with streaming progress (agent-by-agent status)  
128. Results table: Rank | Candidate ID | HRS Score | Semantic | Recruiter | HM | Behavioral | Growth | Authenticity | Action  
129. Row click: expand explanation panel — why\_selected list, missing skills chips, hiring risks, interview questions  
130. Right panel: Skill Radar Chart (Recharts, 6 dimensions) \+ Career Timeline (D3)  
131. Top bar: Export CSV/JSON | Filter by score \> X | Toggle PII reveal (for shortlisted candidates)

**Page: Recruiter Copilot (/copilot)**

132. Split layout: Left panel (60%) \= chat interface; Right panel (40%) \= live candidate cards  
133. Chat input: full-width, glassmorphism background, send on Enter, typing indicator  
134. Messages: user bubbles (right, gold border) vs copilot bubbles (left, cyan border)  
135. Copilot responses stream character-by-character with cursor blink animation  
136. Right panel updates dynamically: 'Candidates mentioned in last response' cards  
137. Suggested queries: 'Why is \#1 better than \#5?', 'Show me candidates with Kubernetes', 'Who is closest to requirements?'

**14.3 Component Library**

| Component | Description | Key Props |
| :---- | :---- | :---- |
| \<ScoreBadge\> | Circular score indicator with color gradient by range (green/amber/red) | score: number, size: 'sm'|'md'|'lg' |
| \<AgentBreakdown\> | Horizontal stacked bar of all agent scores with hover tooltips | scores: AgentScores, labels: boolean |
| \<SkillChip\> | Small chip for skill display, color-coded by match status (matched/gap/unknown) | skill: string, status: MatchStatus |
| \<ExplanationCard\> | Expandable card with evidence list, risk flags, interview Qs, upskilling rec | explanation: Explanation, candidate\_id |
| \<CareerTimeline\> | D3-rendered horizontal timeline with role bubbles, domain color-coding | work\_history: WorkHistory\[\] |
| \<SkillRadar\> | Recharts radar chart with 6 axes: Skills, Projects, Career, Behavioral, Auth, Growth | scores: AgentScores |
| \<CopilotBubble\> | Chat message bubble with SSE streaming text animation | role: 'user'|'copilot', content: string |
| \<RankingTable\> | Sortable, filterable table with expanded row for explanation | rankings: RankedCandidate\[\], onSelect |

**15 — DEPLOYMENT ARCHITECTURE**

**15.1 Local Development (Docker Compose)**

  \# docker-compose.yml — Full local stack

  services:

    postgres:

      image: postgres:16-alpine

      environment: { POSTGRES\_DB: nexus, POSTGRES\_USER: nexus, POSTGRES\_PASSWORD: nexus }

      ports: \['5432:5432'\]

      volumes: \['pgdata:/var/lib/postgresql/data'\]

      healthcheck: { test: \['CMD', 'pg\_isready'\], interval: 10s }

    qdrant:

      image: qdrant/qdrant:v1.9.0

      ports: \['6333:6333', '6334:6334'\]

      volumes: \['qdrantdata:/qdrant/storage'\]

    redis:

      image: redis:7-alpine

      ports: \['6379:6379'\]

      command: redis-server \--maxmemory 2gb \--maxmemory-policy allkeys-lru

    minio:

      image: minio/minio:latest

      ports: \['9000:9000', '9001:9001'\]

      environment: { MINIO\_ROOT\_USER: nexus, MINIO\_ROOT\_PASSWORD: nexuspassword }

      command: server /data \--console-address ':9001'

    backend:

      build: ./backend

      ports: \['8000:8000'\]

      depends\_on: \[postgres, qdrant, redis, minio\]

      environment:

        DATABASE\_URL: postgresql://nexus:nexus@postgres:5432/nexus

        QDRANT\_URL: http://qdrant:6333

        REDIS\_URL: redis://redis:6379

        GEMINI\_API\_KEY: ${GEMINI\_API\_KEY}

    frontend:

      build: ./frontend

      ports: \['3000:3000'\]

      environment: { NEXT\_PUBLIC\_API\_URL: http://backend:8000/api/v1 }

    prometheus:

      image: prom/prometheus:latest

      ports: \['9090:9090'\]

      volumes: \['./infra/prometheus.yml:/etc/prometheus/prometheus.yml'\]

    grafana:

      image: grafana/grafana:latest

      ports: \['3001:3000'\]

      volumes: \['./infra/grafana/dashboards:/var/lib/grafana/dashboards'\]

 

**15.2 Production Architecture (Kubernetes)**

  nexus-production/

  ├── backend-deployment.yaml      \# 3 replicas, HPA at 70% CPU

  ├── frontend-deployment.yaml     \# 2 replicas, CDN-backed static assets

  ├── celery-worker-deployment.yaml  \# 2 replicas, async task processing

  ├── postgres-statefulset.yaml    \# Single primary \+ read replica

  ├── qdrant-statefulset.yaml      \# 3-node cluster with replication

  ├── redis-deployment.yaml        \# Redis Sentinel for HA

  ├── minio-statefulset.yaml       \# 4-node distributed mode

  └── ingress.yaml                 \# NGINX ingress with TLS (Let's Encrypt)

  \# HPA Configuration (backend)

  apiVersion: autoscaling/v2

  kind: HorizontalPodAutoscaler

  spec:

    scaleTargetRef: nexus-backend

    minReplicas: 2

    maxReplicas: 10

    metrics:

      \- type: Resource

        resource: { name: cpu, target: { averageUtilization: 70 } }

 

**15.3 CI/CD Pipeline (GitHub Actions)**

  \# .github/workflows/ci.yml

  on: \[push, pull\_request\]

  jobs:

    test:

      runs-on: ubuntu-latest

      steps:

        \- uses: actions/checkout@v4

        \- name: Run backend tests

          run: docker-compose \-f docker-compose.test.yml up \--abort-on-container-exit

        \- name: Upload coverage

          uses: codecov/codecov-action@v4

    build:

      needs: test

      steps:

        \- name: Build backend image

          run: docker build \-t nexus-backend:${{ github.sha }} ./backend

        \- name: Push to registry

          run: docker push ghcr.io/org/nexus-backend:${{ github.sha }}

    deploy:

      needs: build

      if: github.ref \== 'refs/heads/main'

      steps:

        \- name: Deploy to Kubernetes

          run: kubectl set image deployment/nexus-backend backend=nexus-backend:${{ github.sha }}

        \- name: Wait for rollout

          run: kubectl rollout status deployment/nexus-backend \--timeout=300s

 

**15.4 Environment Variables Reference**

| Variable | Required | Description | Example |
| :---- | :---- | :---- | :---- |
| GEMINI\_API\_KEY | Yes | Gemini API key for all LLM agents | AIza... |
| OPENAI\_API\_KEY | No | OpenAI fallback key for GPT-4.1 Mini | sk-... |
| DATABASE\_URL | Yes | PostgreSQL connection string | postgresql://user:pass@host:5432/nexus |
| QDRANT\_URL | Yes | Qdrant HTTP endpoint | http://localhost:6333 |
| QDRANT\_API\_KEY | No | Qdrant API key (cloud only) | — |
| REDIS\_URL | Yes | Redis connection string | redis://localhost:6379 |
| MINIO\_ENDPOINT | Yes | MinIO S3 endpoint | localhost:9000 |
| MINIO\_ACCESS\_KEY | Yes | MinIO access key | nexus |
| MINIO\_SECRET\_KEY | Yes | MinIO secret key | nexuspassword |
| JWT\_SECRET | Yes | JWT signing secret (RS256 recommended) | your-256-bit-secret |
| BGE\_MODEL\_PATH | No | Local path to BGE-M3 ONNX model | /models/bge-m3 |
| LOG\_LEVEL | No | Logging verbosity | INFO |

 

**15.5 Deployment Checklist**

138. \[ \] All environment variables set in .env or Kubernetes Secrets  
139. \[ \] PostgreSQL migrations run: alembic upgrade head  
140. \[ \] Qdrant collections created: job\_embeddings, candidate\_embeddings, project\_embeddings  
141. \[ \] MinIO bucket created: nexus-resumes (with private ACL)  
142. \[ \] BGE-M3 model downloaded: huggingface-cli download BAAI/bge-m3  
143. \[ \] Health endpoint returning 200: GET /health  
144. \[ \] Seed data loaded: python scripts/seed\_demo\_data.py  
145. \[ \] Prometheus scraping backend /metrics endpoint  
146. \[ \] Grafana dashboard imported from infra/grafana/dashboards/nexus.json  
147. \[ \] End-to-end test: upload resume → rank job → verify explanation present

 

**━━ END OF NEXUS COMPLETE DOCUMENTATION SUITE ━━**

NEXUS · AI Hiring Intelligence Platform · v1.0 · 2026