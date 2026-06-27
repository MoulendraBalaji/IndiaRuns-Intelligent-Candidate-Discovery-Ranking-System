from typing import List
from app.schemas.retrieval import RetrievalResult
from app.schemas.job import JobProfile

class RetrievalReranker:
    """
    Lightweight logic to slightly adjust ordering based on metadata mismatches 
    before sending to the heavy Evaluation Agent.
    """
    @classmethod
    def rerank(cls, job: JobProfile, results: List[RetrievalResult]) -> List[RetrievalResult]:
        # Simple heuristic: heavily penalize results that don't have good metadata scores
        # In a real system, a Cross-Encoder model might live here.
        
        # We sort by a combined score: 80% semantic + 20% metadata
        results.sort(
            key=lambda r: (r.semantic_score * 0.8) + (r.metadata_score * 0.2),
            reverse=True
        )
        
        # Update ranks
        for i, res in enumerate(results):
            res.retrieval_rank = i + 1
            
        return results
