import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_system_stats_endpoint():
    response = client.get("/api/v1/system/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "qdrant_status" in data
    assert "latencies" in data

@patch("app.api.v1.endpoints.candidates.candidate_service")
def test_upload_resume_endpoint(mock_candidate_service):
    # Setup mock profile
    from app.schemas.candidate import CandidateProfile
    mock_profile = CandidateProfile(
        id="c1",
        tenant_id="t1",
        first_name="John",
        last_name="Doe",
        summary="A great engineer",
        education=[],
        experience=[],
        hard_skills=["Python"],
        soft_skills=[],
        total_years_experience=5.0
    )
    mock_candidate_service.upload_resume = AsyncMock(return_value=mock_profile)
    
    file_payload = {"file": ("resume.pdf", b"pdf content", "application/pdf")}
    form_payload = {"tenant_id": "t1"}
    
    response = client.post(
        "/api/v1/candidates/upload",
        files=file_payload,
        data=form_payload
    )
    
    assert response.status_code == 201
    assert response.json()["id"] == "c1"
    mock_candidate_service.upload_resume.assert_called_once()

@patch("app.api.v1.endpoints.jobs.job_service")
def test_create_job_endpoint(mock_job_service):
    from app.schemas.job import JobProfile
    mock_job = JobProfile(
        tenant_id="t1",
        id="j1",
        title="Software Engineer",
        summary="Looking for someone...",
        mandatory_skills=["Python"],
        preferred_skills=[],
        min_years_experience=3.0
    )
    mock_job_service.create_job = AsyncMock(return_value=mock_job)
    
    response = client.post(
        "/api/v1/jobs",
        json={"title": "Software Engineer", "raw_jd": "Job description here...", "role_type": "BACKEND_ENGINEER"}
    )
    
    assert response.status_code == 201
    assert response.json()["id"] == "j1"
    mock_job_service.create_job.assert_called_once()

@patch("app.api.v1.endpoints.matching.matching_service")
def test_trigger_match_endpoint(mock_matching_service):
    mock_matching_service.start_matching = AsyncMock(return_value="task-123")
    
    response = client.post(
        "/api/v1/jobs/j1/match",
        params={"limit": 5, "k": 20}
    )
    
    assert response.status_code == 202
    assert response.json()["task_id"] == "task-123"
    assert response.json()["status"] == "PENDING"
    mock_matching_service.start_matching.assert_called_once_with(job_id="j1", limit=5, k=20)

@patch("app.api.v1.endpoints.matching.matching_service")
def test_rerank_endpoint(mock_matching_service):
    mock_result = {
        "ranking_result": {
            "job_id": "j1",
            "rankings": [],
            "total_ranked": 0
        },
        "explainability_reports": []
    }
    mock_matching_service.re_rank = MagicMock(return_value=mock_result)
    
    response = client.post(
        "/api/v1/jobs/j1/re-rank",
        json={"weights": {"technical_fit": 0.5}}
    )
    
    assert response.status_code == 200
    assert "ranking_result" in response.json()
    mock_matching_service.re_rank.assert_called_once_with("j1", {"technical_fit": 0.5})

@patch("app.api.v1.endpoints.copilot.copilot_service")
def test_copilot_chat_endpoint(mock_copilot_service):
    mock_response = {
        "answer": "Candidate C1 is ranked higher because of FastAPI expertise.",
        "referenced_candidate_ids": ["c1"],
        "latency_ms": 120
    }
    mock_copilot_service.execute_query = AsyncMock(return_value=mock_response)
    
    response = client.post(
        "/api/v1/copilot/chat",
        json={"query": "Why is C1 ranked higher?", "history": [], "job_id": "j1"}
    )
    
    assert response.status_code == 200
    assert response.json()["answer"] == mock_response["answer"]
    mock_copilot_service.execute_query.assert_called_once()
