from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class EmbeddingMetadata(BaseModel):
    model: str
    dimension: int
    created_at: str
    checksum: str
    version: str

class CandidatePayload(BaseModel):
    """
    Standardized payload to store alongside embeddings in the vector database.
    Reduces serialization bugs and allows metadata filtering.
    """
    candidate_id: str
    role: Optional[str] = None
    location: Optional[str] = None
    experience_years: float = 0.0
    embedding_version: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RetrievalResult(BaseModel):
    candidate_id: str
    semantic_score: float
    metadata_score: float
    filter_passed: bool
    retrieval_rank: int
    retrieval_time_ms: int
    embedding_version: str
