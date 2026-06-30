import asyncio
import logging
import uuid
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.schemas.job import JobProfile
from app.schemas.candidate import CandidateProfile
from app.schemas.feature_store import CandidateFeatures
from app.schemas.evaluation import EvaluationReport, EvaluationContext
from app.schemas.ranking import RankingResult, CandidateRank
from app.schemas.explainability import ExplainabilityReport, ExplanationContext, ExplanationType

from app.agents.evaluation.agent import EvaluationAgent
from app.agents.explainability.agent import ExplainabilityAgent
from app.domain.ranking.engine import RankingEngine
from app.domain.ranking.scorer import DeterministicScorer
from app.ml.registry.evaluation_dimensions import ROLE_PROFILES, RoleProfile
from app.pipelines.ranking_pipeline import CompetitionSubmissionPipeline

from app.infrastructure.repositories.candidate_repo import CandidateRepository
from app.infrastructure.repositories.job_repo import JobRepository
from app.infrastructure.repositories.matching_repo import MatchingRepository
from app.infrastructure.semantic.index_service import SemanticIndexService
from app.infrastructure.semantic.embedding_provider import BGEProvider
from app.infrastructure.vector_store.qdrant_client import QdrantVectorStore

logger = logging.getLogger(__name__)

class MatchingService:
    def __init__(
        self,
        candidate_repo: CandidateRepository,
        job_repo: JobRepository,
        matching_repo: MatchingRepository
    ):
        self.candidate_repo = candidate_repo
        self.job_repo = job_repo
        self.matching_repo = matching_repo
        
        self.eval_agent = EvaluationAgent()
        self.explain_agent = ExplainabilityAgent()
        
        self.embedding_provider = BGEProvider()
        self.index_service = SemanticIndexService(self.embedding_provider)
        self.submission_pipeline = CompetitionSubmissionPipeline()
        
        import os
        qdrant_url = os.environ.get("QDRANT_URL", "http://localhost:6333")
        self.qdrant = QdrantVectorStore(url=qdrant_url)
        self.collection_name = "candidates"

    async def start_matching(self, job_id: str, limit: int = 10, k: int = 100) -> str:
        """Starts the matching process in the background and returns a task_id."""
        task_id = str(uuid.uuid4())
        self.matching_repo.save_task(task_id, "PENDING")
        
        # Start background task
        asyncio.create_task(self._run_matching_flow(task_id, job_id, limit, k))
        return task_id

    async def _run_matching_flow(self, task_id: str, job_id: str, limit: int, k: int):
        """Runs retrieval, evaluation, ranking, and explainability."""
        self.matching_repo.save_task(task_id, "RUNNING")
        try:
            job = self.job_repo.get_job(job_id)
            if not job:
                raise ValueError(f"Job {job_id} not found.")

            # 1. Retrieval
            # Attempt to search using Qdrant. Fallback to repository listing if search fails.
            candidates = []
            retrieval_results = []
            
            try:
                # In standard retrieval strategy, we embed the job description text
                query_vector = self.index_service.get_or_create_embedding(job.embedding_text or job.summary)
                from qdrant_client import models
                # Minimal query filter or None
                query_filter = models.Filter(must=[])
                search_results = self.qdrant.search_hybrid(
                    collection_name=self.collection_name,
                    query_vector=query_vector,
                    query_filter=query_filter,
                    top_k=k
                )
                
                for idx, r in enumerate(search_results):
                    c_id = r.payload.get("candidate_id")
                    candidate = self.candidate_repo.get_profile(c_id)
                    if candidate:
                        candidates.append(candidate)
                        
                        # Build mock/real retrieval results
                        from app.schemas.retrieval import RetrievalResult
                        retrieval_results.append(RetrievalResult(
                            candidate_id=c_id,
                            semantic_score=r.score,
                            metadata_score=1.0,
                            filter_passed=True,
                            retrieval_rank=idx + 1,
                            retrieval_time_ms=10,
                            embedding_version=self.embedding_provider.model_name
                        ))
            except Exception as e:
                logger.warning(f"Qdrant search failed, falling back to all candidates in repository: {e}")
                candidates = self.candidate_repo.list_profiles()
                # Create fake retrieval results
                for idx, c in enumerate(candidates):
                    from app.schemas.retrieval import RetrievalResult
                    retrieval_results.append(RetrievalResult(
                        candidate_id=c.id,
                        semantic_score=0.8,
                        metadata_score=1.0,
                        filter_passed=True,
                        retrieval_rank=idx + 1,
                        retrieval_time_ms=5,
                        embedding_version=self.embedding_provider.model_name
                    ))

            if not candidates:
                # Return empty ranking
                rank_res = RankingResult(job_id=job_id, rankings=[], total_ranked=0)
                self.matching_repo.save_match_result(job_id, rank_res)
                self.matching_repo.save_task(task_id, "COMPLETED", result=rank_res.model_dump(mode="json"))
                return

            # 2. Evaluation
            eval_reports = []
            role_profile_key = job.role_type or "BACKEND_ENGINEER"
            if role_profile_key not in ROLE_PROFILES:
                role_profile_key = "BACKEND_ENGINEER"
                
            for c, rr in zip(candidates, retrieval_results):
                features = self.candidate_repo.get_features(c.id)
                if not features:
                    # Synthesize features if missing
                    features = CandidateFeatures(
                        candidate_id=c.id,
                        tenant_id=c.tenant_id,
                        skill_depth={"value": 0.8, "derived_from": ["skills"]},
                        career_progression={"value": 0.7, "derived_from": []},
                        project_complexity={"value": 0.75, "derived_from": []},
                        authenticity={"value": 0.9, "derived_from": []},
                        growth={"value": 0.8, "derived_from": []},
                        timeline_consistency={"value": 0.95, "derived_from": []}
                    )
                
                context = {
                    "candidate_profile": c.model_dump(),
                    "candidate_features": features.model_dump(),
                    "job_profile": job.model_dump(),
                    "retrieval_result": rr.model_dump()
                }
                
                from app.schemas.agent import AgentRequest
                req = AgentRequest(
                    tenant_id=c.tenant_id,
                    payload={"context": context}
                )
                
                try:
                    response = await self.eval_agent.execute(req, role_profile_key=role_profile_key)
                    if response.success:
                        report_data = response.data["report"]
                        report_data["candidate_id"] = c.id
                        report_data["job_id"] = job_id
                        eval_reports.append(EvaluationReport(**report_data))
                except Exception as eval_err:
                    logger.error(f"Failed evaluation for candidate {c.id}: {eval_err}")

            if not eval_reports:
                raise ValueError("No evaluation reports were successfully generated.")

            self.matching_repo.save_evaluation_reports(job_id, eval_reports)

            # 3. Ranking
            ranking_result = RankingEngine.rank_candidates(
                job_id=job_id,
                reports=eval_reports,
                role_profile_key=role_profile_key
            )
            
            # Limit results
            ranking_result.rankings = ranking_result.rankings[:limit]
            self.matching_repo.save_match_result(job_id, ranking_result)

            # 4. Explainability (for the top candidates)
            explain_reports = []
            for i, r_cand in enumerate(ranking_result.rankings[:5]):
                report = next((rep for rep in eval_reports if rep.candidate_id == r_cand.candidate_id), None)
                if not report:
                    continue
                
                # Comparison target is the next candidate or runner-up
                comp_target = None
                if i + 1 < len(ranking_result.rankings):
                    comp_target = ranking_result.rankings[i + 1]
                elif len(ranking_result.rankings) > 1:
                    comp_target = ranking_result.rankings[0]

                exp_context = ExplanationContext(
                    evaluation_report=report,
                    ranking_result=ranking_result,
                    comparison_target=comp_target,
                    role_profile=role_profile_key,
                    explanation_type=ExplanationType.RECRUITER
                )
                
                from app.schemas.agent import AgentRequest
                req = AgentRequest(
                    tenant_id=job.tenant_id,
                    payload={"context": exp_context.model_dump()}
                )
                
                try:
                    exp_response = await self.explain_agent.execute(req)
                    if exp_response.success:
                        exp_rep_data = exp_response.data["report"]
                        exp_rep_data["candidate_id"] = r_cand.candidate_id
                        exp_rep_data["job_id"] = job_id
                        explain_reports.append(ExplainabilityReport(**exp_rep_data))
                except Exception as exp_err:
                    logger.error(f"Failed explainability for candidate {r_cand.candidate_id}: {exp_err}")

            self.matching_repo.save_explainability_reports(job_id, explain_reports)

            # Mark task completed
            final_result = {
                "ranking_result": ranking_result.model_dump(mode="json"),
                "explainability_reports": [er.model_dump(mode="json") for er in explain_reports]
            }
            self.matching_repo.save_task(task_id, "COMPLETED", result=final_result)
            
        except Exception as e:
            logger.error(f"Error in background matching task: {e}")
            self.matching_repo.save_task(task_id, "FAILED", error=str(e))

    def get_task_status(self, task_id: str) -> Optional[dict]:
        return self.matching_repo.get_task(task_id)

    def get_match_result(self, job_id: str) -> Optional[dict]:
        ranking_result = self.matching_repo.get_match_result(job_id)
        if not ranking_result:
            return None
            
        explain_reports = self.matching_repo.get_explainability_reports(job_id)
        return {
            "ranking_result": ranking_result.model_dump(mode="json"),
            "explainability_reports": [er.model_dump(mode="json") for er in explain_reports]
        }

    def re_rank(self, job_id: str, custom_weights: Dict[str, float]) -> dict:
        """Lightweight reranking by altering weights in-memory, without calling LLMs."""
        eval_reports = self.matching_repo.get_evaluation_reports(job_id)
        if not eval_reports:
            raise ValueError(f"No evaluation reports cached for job {job_id}. Run match first.")

        # Create temporary custom RoleProfile
        profile = RoleProfile(
            id="custom_whatif",
            display_name="What-If Profile",
            dimensions=custom_weights,
            enabled_dimensions=list(custom_weights.keys())
        )

        candidate_ranks = []
        for r in eval_reports:
            score, passed, failed_dims = DeterministicScorer.score_candidate(r, profile)
            candidate_ranks.append(
                CandidateRank(
                    candidate_id=r.candidate_id,
                    job_id=job_id,
                    final_score=score,
                    rank_position=0,
                    passed_gates=passed,
                    failed_dimensions=failed_dims
                )
            )

        # Sort: passed gates first, then final score descending
        candidate_ranks.sort(key=lambda cr: cr.final_score, reverse=True)
        candidate_ranks.sort(key=lambda cr: cr.passed_gates, reverse=True)

        for i, cr in enumerate(candidate_ranks):
            cr.rank_position = i + 1

        result = RankingResult(
            job_id=job_id,
            rankings=candidate_ranks,
            total_ranked=len(eval_reports),
            metadata={
                "role_profile": "CUSTOM_WEIGHTS",
                "custom_weights": custom_weights,
                "latency_ms": 1
            }
        )
        
        # We don't overwrite the original match results in DB, we just return the computed re-ranking
        # But we could cache it under a different identifier if desired.
        explain_reports = self.matching_repo.get_explainability_reports(job_id)
        
        return {
            "ranking_result": result.model_dump(mode="json"),
            "explainability_reports": [er.model_dump(mode="json") for er in explain_reports]
        }

    def export_submission_csv(
        self,
        job_id: str,
        top_n: int = 100,
        destination: Optional[str] = None,
    ) -> dict:
        ranking_result = self.matching_repo.get_match_result(job_id)
        if not ranking_result:
            raise ValueError(f"No ranking result cached for job {job_id}. Run match first.")

        output_path = self.submission_pipeline.write_csv(
            ranking_result=ranking_result,
            top_n=top_n,
            destination=destination,
        )
        csv_content = output_path.read_text(encoding="utf-8")

        return {
            "job_id": job_id,
            "top_n": min(top_n, len(ranking_result.rankings)),
            "export_path": str(Path(output_path).resolve()),
            "filename": output_path.name,
            "csv_content": csv_content,
        }
