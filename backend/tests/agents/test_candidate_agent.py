import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from app.schemas.document import ResumeDocument
from app.schemas.agent import AgentRequest
from app.agents.candidate_intelligence.agent import CandidateIntelligenceAgent
from app.schemas.extraction import ExtractedEntities, ExtractedRole

@pytest.fixture
def mock_entities():
    return ExtractedEntities(
        first_name="Jane",
        last_name="Doe",
        skills=["Python", "Machine Learning", "FastAPI"],
        roles=[
            ExtractedRole(title="Senior Engineer", company="Tech Corp", start_date="2020-01", description="Did things")
        ],
        projects=[],
        education=[]
    )

@pytest.mark.asyncio
async def test_candidate_intelligence_agent_success(mock_entities):
    # Mock the parser so we don't hit Gemini
    agent = CandidateIntelligenceAgent(api_key="mock")
    agent.parser.parse = AsyncMock(return_value=mock_entities)
    
    req = AgentRequest(
        tenant_id="t1",
        payload={
            "tenant_id": "t1",
            "candidate_id": "c1",
            "raw_text": "Jane Doe Resume...",
            "sections": [],
            "metadata": {}
        }
    )
    
    res = await agent.execute(req)
    
    assert res.success is True
    assert res.data is not None
    assert "profile" in res.data
    assert "features" in res.data
    
    profile = res.data["profile"]
    assert profile["first_name"] == "Jane"
    assert len(profile["experience"]) == 1
    
    features = res.data["features"]
    assert features["skill_depth"]["value"] > 0.0  # Normalized & scaled

@pytest.mark.asyncio
async def test_candidate_intelligence_agent_malformed_input():
    agent = CandidateIntelligenceAgent(api_key="mock")
    
    req = AgentRequest(
        tenant_id="t1",
        payload={"invalid": "payload"}
    )
    
    res = await agent.execute(req)
    assert res.success is False
    assert res.error is not None
