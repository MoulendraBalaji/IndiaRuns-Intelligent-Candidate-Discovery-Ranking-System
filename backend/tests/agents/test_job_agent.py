import pytest
from unittest.mock import AsyncMock

from app.schemas.agent import AgentRequest
from app.schemas.job_extraction import ExtractedJobEntities
from app.agents.job_intelligence.agent import JobIntelligenceAgent

@pytest.fixture
def mock_job_entities():
    return ExtractedJobEntities(
        title="Senior Machine Learning Engineer",
        department="AI Lab",
        skills=["PyTorch", "Docker", "AWS", "Python"],
        responsibilities=["Deploy ML Models to production", "Lead architecture discussions"],
        min_years_experience=5.0,
        max_years_experience=None,
        education="Master's in Computer Science",
        implicit_constraints=["Remote", "Startup experience preferred"],
        clarity_score=0.9,
        missing_sections=[]
    )

@pytest.mark.asyncio
async def test_job_intelligence_agent_success(mock_job_entities):
    # Mock the parser to bypass Gemini
    agent = JobIntelligenceAgent(api_key="mock")
    agent.parser.parse = AsyncMock(return_value=mock_job_entities)
    
    req = AgentRequest(
        tenant_id="t1",
        payload={
            "tenant_id": "t1",
            "job_id": "j1",
            "raw_text": "Looking for a Senior ML Engineer..."
        }
    )
    
    res = await agent.execute(req)
    
    assert res.success is True
    assert "profile" in res.data
    
    profile = res.data["profile"]
    
    # 1. Check Taxonomy (RoleTaxonomyMapper)
    assert profile["taxonomy"]["family"] == "AI Engineering"
    assert profile["taxonomy"]["level"] == "Senior"
    
    # 2. Check Ontology (SkillGraph)
    # PyTorch should be expanded or at least mapped
    requirements = profile["requirements"]
    assert len(requirements) > 0
    req_texts = [r["text"] for r in requirements]
    # 'pytorch' maps to 'deep_learning', 'machine_learning', 'python', 'neural_networks'
    # The agent logic replaces it with one of the expanded skills or keeps it.
    
    # 3. Check Capability Graph
    capabilities = profile["capabilities"]
    cap_names = [c["name"] for c in capabilities]
    # "Deploy ML Models" -> "Deployment & MLOps"
    assert "Deployment & MLOps" in cap_names
    # "Lead architecture" -> "Technical Leadership"
    assert "Technical Leadership" in cap_names
    
    # 4. Check Job Complexity
    assert profile["complexity_score"] > 0.0
    
    # 5. Caching
    # Executing the same request again should hit the cache
    agent.parser.parse.assert_called_once()
    res2 = await agent.execute(req)
    assert res2.success is True
    agent.parser.parse.assert_called_once() # Still 1, didn't call again
