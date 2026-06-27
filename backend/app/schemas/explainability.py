from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from app.schemas.evaluation import EvaluationReport
from app.schemas.ranking import RankingResult, CandidateRank

class ExplanationType(str, Enum):
    RECRUITER = "recruiter"
    HIRING_MANAGER = "hiring_manager"
    CANDIDATE_FEEDBACK = "candidate_feedback"
    EXECUTIVE_SUMMARY = "executive_summary"

class ExplanationContext(BaseModel):
    evaluation_report: EvaluationReport
    ranking_result: RankingResult
    comparison_target: Optional[CandidateRank] = None
    role_profile: str
    explanation_type: ExplanationType = ExplanationType.RECRUITER

class ComparisonDraft(BaseModel):
    compared_to_candidate_id: str
    better_aspects: List[str] = Field(..., description="Dimensions where target candidate excelled")
    worse_aspects: List[str] = Field(..., description="Dimensions where target candidate lagged")
    justification: str = Field(..., description="Comparative rationale")

class ExplanationDraft(BaseModel):
    summary: str = Field(..., description="Explanation of why the candidate received their specific rank.")
    dimension_explanations: Dict[str, str] = Field(default_factory=dict)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    interview_focus: List[str] = Field(default_factory=list)
    development_opportunities: List[str] = Field(default_factory=list, description="Growth areas for the candidate")
    comparisons: List[ComparisonDraft] = Field(default_factory=list)

class ExplainabilityMetadata(BaseModel):
    model_version: str
    prompt_version: str
    timestamp: str
    explanation_confidence: float = Field(..., ge=0.0, le=1.0)
    generation_duration_ms: int = Field(..., description="Time taken to generate in milliseconds")
    schema_version: str = "1.0.0"

class CohortComparison(BaseModel):
    compared_to_candidate_id: str
    better_aspects: List[str]
    worse_aspects: List[str]
    justification: str

class ExplainabilityReport(BaseModel):
    candidate_id: str
    job_id: str
    explanation_type: ExplanationType
    summary: str
    dimension_explanations: Dict[str, str]
    strengths: List[str]
    weaknesses: List[str]
    interview_focus: List[str]
    development_opportunities: List[str]
    comparisons: List[CohortComparison]
    metadata: ExplainabilityMetadata
