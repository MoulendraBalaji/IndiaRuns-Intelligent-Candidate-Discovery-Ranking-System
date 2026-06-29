import pytest
from unittest.mock import MagicMock
from app.schemas.agent import AgentRequest
from app.agents.copilot.agent import CopilotAgent

@pytest.fixture
def mock_context():
    ranking = {
        "job_id": "j1",
        "rankings": [
            {"candidate_id": "c1", "final_score": 0.9, "rank_position": 1},
            {"candidate_id": "c2", "final_score": 0.7, "rank_position": 2}
        ],
        "total_ranked": 2
    }
    return ranking

@pytest.mark.asyncio
async def test_copilot_agent_execution(mock_context):
    agent = CopilotAgent(api_key="mock")
    agent.client.client = MagicMock()
    
    # Mock the Gemini Client response content object
    mock_res = MagicMock()
    mock_res.text = "Based on evaluation reports, candidate c1 was ranked first due to stronger Python experience."
    agent.client.client.models.generate_content = MagicMock(return_value=mock_res)
    
    request = AgentRequest(
        tenant_id="t1",
        payload={
            "query": "Why is c1 ranked above c2?",
            "ranking_result": mock_context,
            "evaluation_reports": [],
            "explainability_reports": []
        }
    )
    
    response = await agent.execute(request)
    
    assert response.success is True
    assert response.data is not None
    assert "answer" in response.data
    
    assert "c1 was ranked first" in response.data["answer"]
    # Heuristic check
    assert "c1" in response.data["referenced_candidate_ids"]
    assert "c2" not in response.data["referenced_candidate_ids"]
