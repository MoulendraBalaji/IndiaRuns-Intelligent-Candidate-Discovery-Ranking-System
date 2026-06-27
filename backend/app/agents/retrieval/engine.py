import time
from typing import List
import logging
from app.schemas.job import JobProfile
from app.schemas.retrieval import RetrievalResult
from .strategy import RetrievalStrategy
from .reranker import RetrievalReranker
from .metrics import RetrievalMetrics

logger = logging.getLogger(__name__)

class RetrievalEngine:
    """
    Orchestrates the retrieval phase.
    """
    def __init__(self, strategy: RetrievalStrategy):
        self.strategy = strategy
        
    def execute(self, job: JobProfile, top_k: int = 100) -> List[RetrievalResult]:
        start = time.time()
        
        # 1. Retrieve candidates via configured strategy
        results = self.strategy.retrieve(job, top_k)
        
        # 2. Rerank (adjust ordering slightly before evaluation)
        results = RetrievalReranker.rerank(job, results)
        
        # 3. Metrics
        latency = int((time.time() - start) * 1000)
        avg_sim = sum(r.semantic_score for r in results) / len(results) if results else 0.0
        RetrievalMetrics.record(job.id or "unknown", latency, top_k, len(results), avg_sim)
        
        return results
