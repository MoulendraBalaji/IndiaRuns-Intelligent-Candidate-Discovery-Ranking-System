import os
import asyncio
import pytest
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent.parent
sys.path.append(str(backend_dir))

from app.infrastructure.repositories.candidate_repo import CandidateRepository
from app.infrastructure.repositories.job_repo import JobRepository
from app.infrastructure.repositories.matching_repo import MatchingRepository
from app.application.candidate_service import CandidateService
from app.application.job_service import JobService
from app.application.matching_service import MatchingService
from services.submission_service import SubmissionService

@pytest.mark.asyncio
async def test_full_pipeline_e2e_smoke():
    """
    E2E Smoke Test verifying the complete workflow:
    Resume Ingestion -> Parsing -> Feature Store -> Vector Index -> Matching -> Ranking -> Explainability -> Export.
    """
    # 1. Clean and initialize local repos
    candidate_repo = CandidateRepository(data_dir="temp_test_data")
    job_repo = JobRepository(data_dir="temp_test_data")
    matching_repo = MatchingRepository(data_dir="temp_test_data")
    
    candidate_service = CandidateService(candidate_repo)
    job_service = JobService(job_repo)
    matching_service = MatchingService(candidate_repo, job_repo, matching_repo)
    
    # Mock resume file content
    mock_resume = b"""
    John Doe
    email: john.doe@example.com
    phone: +1-555-0199
    
    Experience:
    Senior ML Engineer at AI Labs (Jan 2021 - Present)
    - Developed and scaled generative AI applications and pipeline tools using Python, PyTorch and HuggingFace.
    - Led fine-tuning of LLaMA models, improving retrieval performance by 35%.
    - Designed custom BGE vector embeddings pipelines in Qdrant.
    
    Skills:
    Python, PyTorch, Generative AI, Qdrant, LLMs, NLP, Software Architecture, Docker
    
    Education:
    Master of Science in Computer Science, Stanford University (2020)
    """
    
    print("\n--- E2E Smoke Test Step 1: Upload and Parse Resume ---")
    profile = await candidate_service.upload_resume(
        tenant_id="test_tenant",
        filename="john_doe_resume.pdf",
        file_bytes=mock_resume
    )
    
    assert profile is not None
    assert profile.id is not None
    assert profile.first_name.lower() in ("john", "john doe") or profile.first_name != ""
    print(f"Profile parsed successfully: {profile.first_name} {profile.last_name}")
    
    # Verify features exist in store
    features = candidate_repo.get_features(profile.id)
    assert features is not None
    print(f"Features created successfully: Skill Depth = {features.skill_depth.value}")
    
    print("\n--- E2E Smoke Test Step 2: Create Job Profile ---")
    mock_jd = """
    Job Title: Machine Learning Engineer
    Role Description:
    We are looking for an ML Engineer to build production-grade search and ranking applications.
    
    Required Skills:
    Python, PyTorch, Vector Search, LLMs, NLP
    
    Qualifications:
    - 3+ years of experience in ML or Software Engineering
    - Experience with Qdrant or similar vector databases
    """
    
    job = await job_service.create_job(
        tenant_id="test_tenant",
        title="Machine Learning Engineer",
        raw_jd=mock_jd,
        role_type="DATA_SCIENTIST"
    )
    
    assert job is not None
    assert job.id is not None
    print(f"Job created successfully: {job.title} ({job.id})")
    
    print("\n--- E2E Smoke Test Step 3: Run Matching, Ranking & Evaluation Flow ---")
    # Execute matching
    task_id = await matching_service.start_matching(job_id=job.id, limit=5, k=5)
    assert task_id is not None
    
    # Wait for background task to complete (or mocked status)
    for _ in range(30):
        status_dict = matching_service.get_task_status(task_id)
        if status_dict and status_dict.get("status") in ("COMPLETED", "FAILED"):
            break
        await asyncio.sleep(0.5)
        
    status_dict = matching_service.get_task_status(task_id)
    assert status_dict is not None
    assert status_dict.get("status") == "COMPLETED"
    
    # Verify results
    results = matching_service.get_match_result(job.id)
    assert results is not None
    assert "ranking_result" in results
    assert "explainability_reports" in results
    
    rankings = results["ranking_result"]["rankings"]
    assert len(rankings) > 0
    print(f"Ranked {len(rankings)} candidates. Top candidate ID: {rankings[0]['candidate_id']} (Score: {rankings[0]['final_score']})")
    
    explanations = results["explainability_reports"]
    assert len(explanations) > 0
    print(f"Generated {len(explanations)} explanations. Top candidate reasoning summary: {explanations[0]['summary']}")
    
    print("\n--- E2E Smoke Test Step 4: Submission Generation ---")
    # Clean up temp files if exists
    candidates_file = "../dataset/sample_candidates.json" # Use small sample dataset
    
    # Create temp directories and test runner env
    os.environ["INGESTION_LIMIT"] = "5" # limit to 5 candidates for fast local verification
    os.environ["INGESTION_BATCH_SIZE"] = "5"
    
    sub_service = SubmissionService(export_dir="temp_test_data/submissions")
    csv_path = await sub_service.generate_submission_async(
        candidates_file=candidates_file,
        job_description_file="../dataset/job_description.docx", # Use available docx
        team_id="smoke_test_team"
    )
    
    assert Path(csv_path).exists()
    print(f"Submission CSV generated successfully: {csv_path}")
    
    # Verify CSV structure
    import csv
    actual_csv_path = Path(csv_path).with_suffix(".csv")
    with open(actual_csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    assert 1 <= len(rows) <= 100, f"Expected 1-100 rows, got {len(rows)}"
    assert "candidate_id" in rows[0]
    assert "rank" in rows[0]
    assert "score" in rows[0]
    assert "reasoning" in rows[0]
    # All candidate IDs should be real (no Mock placeholders)
    assert all("Mock" not in r["candidate_id"] for r in rows), "Found placeholder candidate IDs"
    print(f"CSV verified. Row count = {len(rows)}, columns match schema specification.")
    
    # Clean up temp data
    import shutil
    try:
        shutil.rmtree("temp_test_data")
    except Exception:
        pass
    
    print("\n--- E2E Smoke Test PASSED! ---")
