import pytest
import json
from unittest.mock import AsyncMock
from app.schemas.agent import AgentRequest
from app.schemas.candidate import CandidateProfile
from app.schemas.feature_store import CandidateFeatures, FeatureValue
from app.schemas.job import JobProfile
from app.schemas.retrieval import RetrievalResult
from app.agents.evaluation.agent import EvaluationAgent

@pytest.fixture
def mock_context():
    candidate_profile = CandidateProfile(
        id="c1",
        tenant_id="t1",
        first_name="Alice",
        last_name="Smith",
        summary="Experienced engineer",
        education=[],
        experience=[],
        hard_skills=["Python", "FastAPI"],
        soft_skills=[],
        total_years_experience=5.0
    )
    candidate_features = CandidateFeatures(
        candidate_id="c1",
        tenant_id="t1",
        skill_depth=FeatureValue(value=0.8),
        career_progression=FeatureValue(value=0.7),
        project_complexity=FeatureValue(value=0.9),
        authenticity=FeatureValue(value=1.0),
        growth=FeatureValue(value=0.8),
        timeline_consistency=FeatureValue(value=0.95),
        versions={}
    )
    job_profile = JobProfile(
        tenant_id="t1",
        id="j1",
        title="Backend Software Engineer",
        min_years_experience=3.0,
        embedding_text="Looking for a Python Backend developer"
    )
    retrieval_result = RetrievalResult(
        candidate_id="c1",
        semantic_score=0.85,
        metadata_score=1.0,
        filter_passed=True,
        retrieval_rank=1,
        retrieval_time_ms=12,
        embedding_version="bge"
    )
    return {
        "candidate_profile": candidate_profile.model_dump(),
        "candidate_features": candidate_features.model_dump(),
        "job_profile": job_profile.model_dump(),
        "retrieval_result": retrieval_result.model_dump()
    }

@pytest.fixture
def mock_llm_response():
    # Return structured mock JSON for EvaluationReport
    report = {
        "candidate_id": "c1",
        "job_id": "j1",
        "metadata": {
            "evaluator_model": "mock",
            "prompt_version": "v1",
            "pipeline_version": "1.0",
            "timestamp": "now"
        },
        "trace": [],
        "dimensions": {
            "technical_fit": {
                "id": "technical_fit",
                "score": 0.9,
                "weight": 0.4,
                "reasoning": "Fits tech perfectly",
                "evidence": [
                    {
                        "fact": "5 years of Python experience",
                        "source": "CandidateProfile",
                        "lineage": ["profile.experience[0]"],
                        "confidence": 0.95,
                        "strength": 0.9
                    }
                ]
            },
            "project_fit": {
                "id": "project_fit",
                "score": 0.8,
                "weight": 0.25,
                "reasoning": "Good complex projects",
                "evidence": []
            }
        },
        "conflicts": [],
        "risks": {
            "technical": 0.1,
            "experience": 0.1,
            "timeline": 0.0,
            "resume_quality": 0.1,
            "confidence": 0.9
        },
        "recommendation": "Strong Hire",
        "overall_reasoning": "Overall excellent fit.",
        "confidence": 0.95,
        "total_duration_ms": 10
    }
    return json.dumps(report)

@pytest.mark.asyncio
async def test_evaluation_agent_execution(mock_context, mock_llm_response):
    agent = EvaluationAgent(api_key="mock")
    
    # Mock the Gemini structured extraction call
    agent.client.generate_structured_extraction = AsyncMock(return_value=mock_llm_response)
    
    request = AgentRequest(
        tenant_id="t1",
        payload={
            "context": mock_context
        }
    )
    
    response = await agent.execute(request, role_profile_key="BACKEND_ENGINEER")
    
    assert response.success is True
    assert response.data is not None
    assert "report" in response.data
    assert "summary" in response.data
    
    report = response.data["report"]
    summary = response.data["summary"]
    
    # 1. Assert weights are dynamically injected from the registry
    # BACKEND_ENGINEER: technical_fit=0.40, project_fit=0.25, etc.
    # Total enabled dimensions = technical_fit, project_fit, domain_fit, experience_fit, behavior_fit
    # Sum of backend weights = 0.40 + 0.25 + 0.10 + 0.15 + 0.10 = 1.0 (already normalized)
    assert report["dimensions"]["technical_fit"]["weight"] == 0.40
    assert report["dimensions"]["project_fit"]["weight"] == 0.25
    
    # 2. Check dynamic calculation of overall score in summary
    # overall_score = sum(dim.score * dim.weight)
    # Since we only have technical_fit (0.9 * 0.4 = 0.36) and project_fit (0.8 * 0.25 = 0.20) in mock data
    # (other registry dimensions default to 0 score since they aren't in LLM response dict, which is normal for sparse mock response)
    # Sum is 0.56
    assert summary["overall_score"] == pytest.approx(0.56)
    
    # 3. Strengths and Gaps correctly populated from evidence
    assert "5 years of Python experience" in summary["top_strengths"]
