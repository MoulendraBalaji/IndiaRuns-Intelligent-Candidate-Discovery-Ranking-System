import time
from typing import List
from app.schemas.evaluation import EvaluationReport
from app.schemas.ranking import CandidateRank, RankingResult
from app.ml.registry.evaluation_dimensions import ROLE_PROFILES
from .scorer import DeterministicScorer

class RankingEngine:
    """
    Ranks multiple candidates based on their structured EvaluationReports
    and the configured RoleProfile.
    """
    @staticmethod
    def rank_candidates(
        job_id: str, 
        reports: List[EvaluationReport], 
        role_profile_key: str = "BACKEND_ENGINEER"
    ) -> RankingResult:
        start_time = time.time()
        
        # 1. Resolve role profile
        profile = ROLE_PROFILES.get(role_profile_key)
        if not profile:
            raise ValueError(f"Unknown role profile: {role_profile_key}")

        # 2. Score candidates
        candidate_ranks = []
        for r in reports:
            score, passed, failed_dims = DeterministicScorer.score_candidate(r, profile)
            candidate_ranks.append(
                CandidateRank(
                    candidate_id=r.candidate_id,
                    job_id=job_id,
                    final_score=score,
                    rank_position=0,  # Settled after sorting
                    passed_gates=passed,
                    failed_dimensions=failed_dims
                )
            )

        # 3. Sort: Pass gates first, then score descending
        # Python's Timsort is stable, so we can sort by score first, then by passed_gates.
        candidate_ranks.sort(key=lambda cr: cr.final_score, reverse=True)
        candidate_ranks.sort(key=lambda cr: cr.passed_gates, reverse=True)

        # 4. Populate cohort positions
        for i, cr in enumerate(candidate_ranks):
            cr.rank_position = i + 1

        latency_ms = int((time.time() - start_time) * 1000)

        metadata = {
            "role_profile": role_profile_key,
            "engine_version": "1.0.0",
            "latency_ms": latency_ms
        }

        return RankingResult(
            job_id=job_id,
            rankings=candidate_ranks,
            total_ranked=len(reports),
            metadata=metadata
        )
