import pytest
from app.schemas.evaluation import EvaluationReport, EvaluationMetadata, RiskAssessment, RecommendationOpinion, EvaluationDimensionScore
from app.domain.ranking.engine import RankingEngine

@pytest.fixture
def mock_evaluation_reports():
    # Candidate 1: Passed all gates, high tech fit (0.90)
    c1 = EvaluationReport(
        candidate_id="c1",
        job_id="j1",
        metadata=EvaluationMetadata(evaluator_model="mock", prompt_version="v1", pipeline_version="1", timestamp="now"),
        dimensions={
            "technical_fit": EvaluationDimensionScore(id="technical_fit", score=0.9, weight=0.4, reasoning=""),
            "project_fit": EvaluationDimensionScore(id="project_fit", score=0.8, weight=0.25, reasoning=""),
            "domain_fit": EvaluationDimensionScore(id="domain_fit", score=0.7, weight=0.1, reasoning=""),
            "experience_fit": EvaluationDimensionScore(id="experience_fit", score=0.8, weight=0.15, reasoning=""),
            "behavior_fit": EvaluationDimensionScore(id="behavior_fit", score=0.7, weight=0.1, reasoning="")
        },
        risks=RiskAssessment(technical=0.1, experience=0.1, timeline=0.0, resume_quality=0.0, confidence=0.9),
        recommendation=RecommendationOpinion.STRONG_HIRE,
        overall_reasoning="",
        confidence=0.9,
        total_duration_ms=10
    )

    # Candidate 2: Failed technical fit threshold gate (0.50 score vs 0.70 override threshold)
    c2 = EvaluationReport(
        candidate_id="c2",
        job_id="j1",
        metadata=EvaluationMetadata(evaluator_model="mock", prompt_version="v1", pipeline_version="1", timestamp="now"),
        dimensions={
            "technical_fit": EvaluationDimensionScore(id="technical_fit", score=0.5, weight=0.4, reasoning=""),
            "project_fit": EvaluationDimensionScore(id="project_fit", score=0.9, weight=0.25, reasoning=""),
            "domain_fit": EvaluationDimensionScore(id="domain_fit", score=0.8, weight=0.1, reasoning=""),
            "experience_fit": EvaluationDimensionScore(id="experience_fit", score=0.9, weight=0.15, reasoning=""),
            "behavior_fit": EvaluationDimensionScore(id="behavior_fit", score=0.9, weight=0.1, reasoning="")
        },
        risks=RiskAssessment(technical=0.5, experience=0.1, timeline=0.0, resume_quality=0.0, confidence=0.9),
        recommendation=RecommendationOpinion.INTERVIEW,
        overall_reasoning="",
        confidence=0.9,
        total_duration_ms=10
    )

    # Candidate 3: Passed all gates, slightly lower score than Candidate 1 (0.80 overall-ish)
    c3 = EvaluationReport(
        candidate_id="c3",
        job_id="j1",
        metadata=EvaluationMetadata(evaluator_model="mock", prompt_version="v1", pipeline_version="1", timestamp="now"),
        dimensions={
            "technical_fit": EvaluationDimensionScore(id="technical_fit", score=0.8, weight=0.4, reasoning=""),
            "project_fit": EvaluationDimensionScore(id="project_fit", score=0.7, weight=0.25, reasoning=""),
            "domain_fit": EvaluationDimensionScore(id="domain_fit", score=0.7, weight=0.1, reasoning=""),
            "experience_fit": EvaluationDimensionScore(id="experience_fit", score=0.7, weight=0.15, reasoning=""),
            "behavior_fit": EvaluationDimensionScore(id="behavior_fit", score=0.7, weight=0.1, reasoning="")
        },
        risks=RiskAssessment(technical=0.2, experience=0.2, timeline=0.0, resume_quality=0.0, confidence=0.9),
        recommendation=RecommendationOpinion.HIRE,
        overall_reasoning="",
        confidence=0.9,
        total_duration_ms=10
    )

    return [c1, c2, c3]

def test_ranking_engine_sorting_and_gates(mock_evaluation_reports):
    res = RankingEngine.rank_candidates(
        job_id="j1",
        reports=mock_evaluation_reports,
        role_profile_key="BACKEND_ENGINEER"
    )

    assert res.total_ranked == 3
    
    # Rankings should be:
    # 1. Candidate 1 (passed gates, highest score)
    # 2. Candidate 3 (passed gates, second highest score)
    # 3. Candidate 2 (failed gates, pushed to bottom)
    
    assert res.rankings[0].candidate_id == "c1"
    assert res.rankings[0].passed_gates is True
    
    assert res.rankings[1].candidate_id == "c3"
    assert res.rankings[1].passed_gates is True
    
    assert res.rankings[2].candidate_id == "c2"
    assert res.rankings[2].passed_gates is False
    assert "technical_fit" in res.rankings[2].failed_dimensions
    
    # Verify exact rank positions
    assert res.rankings[0].rank_position == 1
    assert res.rankings[1].rank_position == 2
    assert res.rankings[2].rank_position == 3
