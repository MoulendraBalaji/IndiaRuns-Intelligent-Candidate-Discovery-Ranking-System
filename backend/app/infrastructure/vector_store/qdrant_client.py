import logging
import uuid
from typing import List, Tuple
from pydantic import BaseModel
from qdrant_client import QdrantClient, models

from app.schemas.retrieval import CandidatePayload

logger = logging.getLogger(__name__)

class CollectionConfig(BaseModel):
    name: str
    embedding_model: str
    dimension: int

class QdrantVectorStore:
    def __init__(self, url: str = "http://localhost:6333"):
        self.client = QdrantClient(url=url)
        
    def ensure_collection(self, config: CollectionConfig):
        collections = self.client.get_collections().collections
        exists = any(c.name == config.name for c in collections)
        
        if not exists:
            logger.info(f"Creating Qdrant collection: {config.name}")
            self.client.create_collection(
                collection_name=config.name,
                vectors_config=models.VectorParams(
                    size=config.dimension,
                    distance=models.Distance.COSINE
                )
            )
            # Create payload indices for fast metadata filtering
            self.client.create_payload_index(config.name, field_name="role", field_schema=models.PayloadSchemaType.KEYWORD)
            self.client.create_payload_index(config.name, field_name="location", field_schema=models.PayloadSchemaType.KEYWORD)
            self.client.create_payload_index(config.name, field_name="experience_years", field_schema=models.PayloadSchemaType.FLOAT)
            
    def upsert_candidates(self, collection_name: str, records: List[Tuple[List[float], CandidatePayload]]):
        points = []
        for emb, payload in records:
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, payload.candidate_id))
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=emb,
                    payload=payload.model_dump(mode="json")
                )
            )
            
        if points:
            self.client.upsert(
                collection_name=collection_name,
                points=points
            )
            logger.info(f"Upserted {len(points)} candidates into {collection_name}")

    def search_hybrid(
        self, 
        collection_name: str, 
        query_vector: List[float], 
        query_filter: models.Filter, 
        top_k: int = 100
    ):
        return self.client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=top_k
        )
