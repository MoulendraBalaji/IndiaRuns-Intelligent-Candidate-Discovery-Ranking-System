import pytest
from app.schemas.evaluation import (
    EvaluationReport, EvaluationMetadata, RiskAssessment, 
    RecommendationOpinion, EvaluationDimensionScore, EvaluationSummary
)
from app.ml.registry.evaluation_dimensions import ROLE_PROFILES, DIMENSION_METADATA

def test_evaluation_registry_normalization():
    backend_profile = ROLE_PROFILES["BACKEND_ENGINEER"]
    weights = backend_profile.get_normalized_weights()
    
    # Verify enabled weights sum up to exactly 1.0
    assert sum(weights.values()) == pytest.approx(1.0)
    
    # Verify threshold overrides work
    assert backend_profile.thresholds.get("technical_fit") == 0.70
    assert DIMENSION_METADATA["technical_fit"].minimum_threshold == 0.60  # default unchanged

def test_evaluation_summary_validation():
    summary = EvaluationSummary(
        overall_score=0.85,
        recommendation=RecommendationOpinion.STRONG_HIRE,
        confidence=0.95,
        top_strengths=["5 years of Python", "FastAPI architecture"],
        top_gaps=["No Kubernetes experience"]
    )
    
    assert summary.overall_score == 0.85
    assert summary.recommendation == "Strong Hire"
