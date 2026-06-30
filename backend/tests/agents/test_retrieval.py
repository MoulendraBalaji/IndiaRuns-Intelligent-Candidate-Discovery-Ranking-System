import pytest
from app.schemas.job import JobProfile
from app.schemas.candidate import CandidateProfile
from app.infrastructure.semantic.embedding_provider import BGEProvider
from app.infrastructure.semantic.index_service import SemanticIndexService
from app.infrastructure.vector_store.qdrant_client import QdrantVectorStore, CollectionConfig
from app.agents.retrieval.strategy import HybridRetrieval
from app.agents.retrieval.engine import RetrievalEngine

# This test requires Qdrant running locally, we can mark it appropriately
@pytest.mark.asyncio
async def test_retrieval_end_to_end():
    # Setup
    provider = BGEProvider()
    index_service = SemanticIndexService(provider)
    qdrant = QdrantVectorStore(url="http://localhost:6333")
    
    collection_name = "test_candidates"
    config = CollectionConfig(
        name=collection_name, 
        embedding_model=provider.model_name, 
        dimension=provider.dimension
    )
    
    try:
        qdrant.ensure_collection(config)
    except Exception as e:
        pytest.skip(f"Qdrant not available: {e}")
        
    # Mock Candidates
    c1 = CandidateProfile(id="c1", current_role="ML Engineer", location="Remote", experience_years=5.0, skills=[], history=[], embedding_text="Expert in Python, PyTorch, and Deep Learning.")
    c2 = CandidateProfile(id="c2", current_role="Frontend Dev", location="Onsite", experience_years=2.0, skills=[], history=[], embedding_text="Expert in React, TypeScript, and UI Design.")
    
    # Index
    records = index_service.index_candidates([c1, c2])
    qdrant.upsert_candidates(collection_name, records)
    
    # Wait for Qdrant indexing
    import time
    time.sleep(1)
    
    # Setup Retrieval
    strategy = HybridRetrieval(index_service, qdrant, collection_name)
    engine = RetrievalEngine(strategy)
    
    # Mock Job
    job = JobProfile(
        tenant_id="test",
        id="j1",
        title="Senior ML Engineer",
        min_years_experience=3.0,
        constraints=["Remote"],
        embedding_text="Looking for someone with deep learning experience using PyTorch."
    )
    
    # Retrieve
    results = engine.execute(job, top_k=5)
    
    # Verification
    assert len(results) > 0
    # c1 should be retrieved, possibly c2 filtered out or ranked lower
    assert any(r.candidate_id == "c1" for r in results)
