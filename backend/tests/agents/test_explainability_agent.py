import pytest
import json
from unittest.mock import AsyncMock
from app.schemas.agent import AgentRequest
from app.schemas.evaluation import EvaluationReport, EvaluationMetadata, RiskAssessment, RecommendationOpinion, EvaluationDimensionScore
from app.schemas.ranking import RankingResult, CandidateRank
from app.schemas.explainability import ExplanationContext, ExplanationType
from app.agents.explainability.agent import ExplainabilityAgent

@pytest.fixture
def mock_context():
    report = EvaluationReport(
        candidate_id="c1",
        job_id="j1",
        metadata=EvaluationMetadata(evaluator_model="mock", prompt_version="v1", pipeline_version="1", timestamp="now"),
        dimensions={
            "technical_fit": EvaluationDimensionScore(id="technical_fit", score=0.9, weight=0.4, reasoning=""),
        },
        risks=RiskAssessment(technical=0.1, experience=0.1, timeline=0.0, resume_quality=0.0, confidence=0.9),
        recommendation=RecommendationOpinion.STRONG_HIRE,
        overall_reasoning="Alice is highly qualified.",
        confidence=0.95,
        total_duration_ms=10
    )
    result = RankingResult(
        job_id="j1",
        rankings=[
            CandidateRank(candidate_id="c1", job_id="j1", final_score=0.9, rank_position=1, passed_gates=True),
            CandidateRank(candidate_id="c2", job_id="j1", final_score=0.7, rank_position=2, passed_gates=True)
        ],
        total_ranked=2,
        metadata={}
    )
    context = ExplanationContext(
        evaluation_report=report,
        ranking_result=result,
        comparison_target=result.rankings[1], # Compare c1 against c2
        role_profile="BACKEND_ENGINEER",
        explanation_type=ExplanationType.RECRUITER
    )
    return context

@pytest.fixture
def mock_draft_response():
    draft = {
        "summary": "Alice outranked Bob because of stronger FastAPI experience.",
        "dimension_explanations": {
            "technical_fit": "Alice has 5 years of Python vs Bob's 2 years."
        },
        "strengths": ["Python expertise"],
        "weaknesses": [],
        "interview_focus": ["System scaling"],
        "development_opportunities": ["Kubernetes clustering"],
        "comparisons": [
            {
                "compared_to_candidate_id": "c2",
                "better_aspects": ["technical_fit"],
                "worse_aspects": [],
                "justification": "Higher technical skill alignment."
            }
        ]
    }
    return json.dumps(draft)

@pytest.mark.asyncio
async def test_explainability_agent_execution(mock_context, mock_draft_response):
    agent = ExplainabilityAgent(api_key="mock")
    
    # Mock Gemini extraction call
    agent.client.generate_structured_extraction = AsyncMock(return_value=mock_draft_response)
    
    request = AgentRequest(
        tenant_id="t1",
        payload={
            "context": mock_context.model_dump()
        }
    )
    
    response = await agent.execute(request)
    
    assert response.success is True
    assert response.data is not None
    assert "report" in response.data
    
    report = response.data["report"]
    
    # Verify metadata and system-assigned fields
    assert report["candidate_id"] == "c1"
    assert report["job_id"] == "j1"
    assert report["explanation_type"] == "recruiter"
    assert report["summary"] == "Alice outranked Bob because of stronger FastAPI experience."
    
    # Verify comparisons mapped correctly
    assert len(report["comparisons"]) == 1
    assert report["comparisons"][0]["compared_to_candidate_id"] == "c2"
    
    # Telemetry
    assert report["metadata"]["generation_duration_ms"] >= 0
    assert report["metadata"]["explanation_confidence"] == 0.95
