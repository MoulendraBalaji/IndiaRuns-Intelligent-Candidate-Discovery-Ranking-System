import pytest
from pydantic import ValidationError
from app.schemas.candidate import CandidateProfile
from app.schemas.job import JobProfile
from app.schemas.feature_store import CandidateFeatures
from app.schemas.evaluation import EvaluationResult
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
        CandidateFeatures(candidate_id="c1", tenant_id="t1", skill_depth=1.5)
    
    # Valid
    features = CandidateFeatures(candidate_id="c1", tenant_id="t1", skill_depth=0.8)
    assert features.skill_depth == 0.8

def test_evaluation_result_bounds():
    with pytest.raises(ValidationError):
        EvaluationResult(candidate_id="c1", job_id="j1", skill_match_score=-0.1, evaluation_summary="Bad")
        
    eval_res = EvaluationResult(candidate_id="c1", job_id="j1", skill_match_score=0.9, evaluation_summary="Good")
    assert eval_res.skill_match_score == 0.9

def test_ranking_valid():
    rank = CandidateRank(candidate_id="c1", job_id="j1", final_score=0.85, semantic_score=0.9, evaluation_score=0.8, feature_score=0.85)
    assert rank.final_score == 0.85

def test_agent_contracts():
    req = AgentRequest(tenant_id="t1", payload={"resume_text": "hello"})
    assert req.payload["resume_text"] == "hello"
    
    res = AgentResponse(success=True, data={"parsed": True}, processing_time_ms=150)
    assert res.success is True
    assert res.processing_time_ms == 150
