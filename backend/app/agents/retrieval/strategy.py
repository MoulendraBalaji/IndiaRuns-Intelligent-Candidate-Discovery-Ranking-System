from abc import ABC, abstractmethod
from typing import List
import time
from app.schemas.job import JobProfile
from app.schemas.retrieval import RetrievalResult
from app.infrastructure.vector_store.qdrant_client import QdrantVectorStore
from app.infrastructure.semantic.index_service import SemanticIndexService
from .filters import MetadataFilterBuilder

class RetrievalStrategy(ABC):
    @abstractmethod
    def retrieve(self, job: JobProfile, top_k: int = 100) -> List[RetrievalResult]:
        pass

class HybridRetrieval(RetrievalStrategy):
    """
    Retrieves candidates using a combination of vector similarity and metadata filtering.
    """
    def __init__(self, index_service: SemanticIndexService, qdrant: QdrantVectorStore, collection_name: str):
        self.index_service = index_service
        self.qdrant = qdrant
        self.collection_name = collection_name
        
    def retrieve(self, job: JobProfile, top_k: int = 100) -> List[RetrievalResult]:
        start = time.time()
        
        # 1. Embed Job
        job_emb = self.index_service.get_or_create_embedding(job.embedding_text)
        
        # 2. Build Filter
        query_filter = MetadataFilterBuilder.build_hybrid_filter(job)
        
        # 3. Query Qdrant
        points = self.qdrant.search_hybrid(
            collection_name=self.collection_name,
            query_vector=job_emb,
            query_filter=query_filter,
            top_k=top_k
        )
        
        # 4. Map to RetrievalResult
        results = []
        for i, pt in enumerate(points):
            payload = pt.payload or {}
            
            # Simple metadata score heuristic for demonstration
            # In a real system, we'd compare job reqs vs candidate payload specifically
            metadata_score = 1.0
            
            res = RetrievalResult(
                candidate_id=payload.get("candidate_id", str(pt.id)),
                semantic_score=pt.score,
                metadata_score=metadata_score,
                filter_passed=True, # they passed the qdrant filter
                retrieval_rank=i + 1,
                retrieval_time_ms=int((time.time() - start) * 1000),
                embedding_version=payload.get("embedding_version", "unknown")
            )
            results.append(res)
            
        return results
