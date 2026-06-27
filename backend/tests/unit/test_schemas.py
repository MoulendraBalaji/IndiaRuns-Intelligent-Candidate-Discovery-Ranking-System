import pytest
from pydantic import ValidationError
from app.schemas.candidate import CandidateProfile
from app.schemas.job import JobProfile
from app.schemas.feature_store import CandidateFeatures, FeatureValue
from app.schemas.evaluation import EvaluationSummary
from app.schemas.ranking import CandidateRank
from app.schemas.agent import AgentRequest, AgentResponse

def test_candidate_profile_valid():
    data = {
        "tenant_id": "tenant-123",
        "first_name": "John",
        "last_name": "Doe",
        "summary": "Experienced software engineer",
        "education": [{"degree": "BSc", "major": "CS", "institution": "MIT"}],
        "experience": [{"title": "SDE", "company": "Google", "responsibilities": ["Coding"]}],
        "hard_skills": ["Python"],
        "soft_skills": ["Leadership"],
        "total_years_experience": 5.0
    }
    profile = CandidateProfile(**data)
    assert profile.first_name == "John"
    assert profile.tenant_id == "tenant-123"

def test_candidate_profile_missing_required():
    with pytest.raises(ValidationError):
        CandidateProfile(first_name="John") # missing tenant_id, summary, etc.

def test_job_profile_valid():
    data = {
        "tenant_id": "tenant-123",
        "title": "Backend Engineer",
        "summary": "Looking for a python dev",
        "mandatory_skills": ["Python", "FastAPI"],
        "min_years_experience": 3.0
    }
    job = JobProfile(**data)
    assert job.title == "Backend Engineer"

def test_feature_store_bounds():
    with pytest.raises(ValidationError):
        # skill_depth > 1.0 should fail
        CandidateFeatures(candidate_id="c1", tenant_id="t1", skill_depth=FeatureValue(value=1.5, derived_from=["a"]), career_progression=FeatureValue(value=0.5), project_complexity=FeatureValue(value=0.5), authenticity=FeatureValue(value=0.5), growth=FeatureValue(value=0.5), timeline_consistency=FeatureValue(value=0.5))
    
    features = CandidateFeatures(candidate_id="c1", tenant_id="t1", skill_depth=FeatureValue(value=0.8), career_progression=FeatureValue(value=0.5), project_complexity=FeatureValue(value=0.5), authenticity=FeatureValue(value=0.5), growth=FeatureValue(value=0.5), timeline_consistency=FeatureValue(value=0.5))
    assert features.skill_depth.value == 0.8

def test_evaluation_summary_bounds():
    from app.schemas.evaluation import RecommendationOpinion
    with pytest.raises(ValidationError):
        EvaluationSummary(overall_score=-0.1, recommendation=RecommendationOpinion.STRONG_HIRE, confidence=0.9)
        
    eval_res = EvaluationSummary(overall_score=0.9, recommendation=RecommendationOpinion.STRONG_HIRE, confidence=0.95)
    assert eval_res.overall_score == 0.9

def test_ranking_valid():
    rank = CandidateRank(
        candidate_id="c1",
        job_id="j1",
        final_score=0.85,
        rank_position=1,
        passed_gates=True,
        failed_dimensions=[]
    )
    assert rank.final_score == 0.85

def test_agent_contracts():
    req = AgentRequest(tenant_id="t1", payload={"resume_text": "hello"})
    assert req.payload["resume_text"] == "hello"
    
    res = AgentResponse(success=True, data={"parsed": True}, processing_time_ms=150)
    assert res.success is True
    assert res.processing_time_ms == 150
