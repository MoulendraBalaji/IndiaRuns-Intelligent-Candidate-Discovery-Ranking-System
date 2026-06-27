import time
import logging
from typing import List, Tuple
from app.schemas.candidate import CandidateProfile
from app.schemas.retrieval import CandidatePayload
from .embedding_provider import EmbeddingProvider
from .embedding_cache import EmbeddingCache
from .vector_serializer import VectorSerializer

logger = logging.getLogger(__name__)

class SemanticIndexService:
    """
    Orchestrates candidate indexing: caching, embedding, and vector DB insertion.
    """
    def __init__(self, provider: EmbeddingProvider):
        self.provider = provider
        self.cache = EmbeddingCache()

    def get_or_create_embedding(self, text: str) -> List[float]:
        cached = self.cache.get(text)
        if cached:
            return cached
            
        start = time.time()
        embedding = self.provider.embed_text(text)
        self.cache.set(text, embedding)
        logger.info(f"Generated embedding in {(time.time()-start)*1000:.1f}ms")
        
        return embedding
        
    def get_or_create_batch(self, texts: List[str]) -> List[List[float]]:
        # For simplicity, if any is missing from cache, embed all.
        # A more advanced implementation would partially embed.
        results = []
        to_embed = []
        to_embed_indices = []
        
        for i, text in enumerate(texts):
            cached = self.cache.get(text)
            if cached:
                results.append(cached)
            else:
                results.append(None)
                to_embed.append(text)
                to_embed_indices.append(i)
                
        if to_embed:
            start = time.time()
            new_embeddings = self.provider.embed_batch(to_embed)
            logger.info(f"Generated batch embeddings in {(time.time()-start)*1000:.1f}ms")
            for text, emb, idx in zip(to_embed, new_embeddings, to_embed_indices):
                self.cache.set(text, emb)
                results[idx] = emb
                
        return results

    def index_candidates(self, candidates: List[CandidateProfile]) -> List[Tuple[List[float], CandidatePayload]]:
        texts = [c.embedding_text for c in candidates]
        embeddings = self.get_or_create_batch(texts)
        
        records = []
        for c, emb in zip(candidates, embeddings):
            payload = VectorSerializer.to_candidate_payload(c, self.provider.model_name)
            records.append((emb, payload))
            
        # In a real system, we would insert these into Qdrant right here.
        # We will integrate with Qdrant via QdrantClient next.
        return records
