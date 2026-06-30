from enum import Enum
from typing import List, Dict
from pydantic import BaseModel, Field
from app.schemas.candidate import CandidateProfile
from app.schemas.feature_store import CandidateFeatures
from app.schemas.job import JobProfile
from app.schemas.retrieval import RetrievalResult

class RecommendationOpinion(str, Enum):
    STRONG_HIRE = "Strong Hire"
    HIRE = "Hire"
    INTERVIEW = "Interview"
    MAYBE = "Maybe"
    REJECT = "Reject"

class EvaluationContext(BaseModel):
    candidate_profile: CandidateProfile
    candidate_features: CandidateFeatures
    job_profile: JobProfile
    retrieval_result: RetrievalResult

class EvaluationMetadata(BaseModel):
    evaluator_model: str
    prompt_version: str
    pipeline_version: str
    timestamp: str
    schema_version: str = "1.0.0"

class EvaluationEvidence(BaseModel):
    fact: str = Field(..., description="A concrete extracted fact, e.g., '5 years of Python experience'")
    source: str = Field(..., description="E.g., 'CandidateProfile'")
    lineage: List[str] = Field(default_factory=list, description="Specific path keys, e.g., ['profile.experience[0]']")
    confidence: float = Field(..., ge=0.0, le=1.0, description="How sure evaluator is of the fact")
    strength: float = Field(..., ge=0.0, le=1.0, description="How strongly the fact supports the score")

class EvaluationTrace(BaseModel):
    step: str = Field(..., description="The evaluation step name, e.g., 'technical_fit'")
    input_features: List[str] = Field(..., description="Input parameters/skills analyzed in this step")
    reason: str = Field(..., description="Detailed explanation of the trace step evaluation")
    confidence: float = Field(..., ge=0.0, le=1.0)
    duration_ms: int = Field(..., description="Time taken to evaluate this step in milliseconds")

class EvaluationDimensionScore(BaseModel):
    id: str = Field(..., description="The ID of the dimension, e.g., 'technical_fit'")
    score: float = Field(..., ge=0.0, le=1.0)
    weight: float = Field(..., ge=0.0, le=1.0)
    reasoning: str = Field(..., description="Detailed breakdown for this dimension")
    evidence: List[EvaluationEvidence] = Field(default_factory=list)

class EvaluationConflict(BaseModel):
    field: str = Field(..., description="Topic of conflict, e.g., 'Python'")
    severity: str = Field(..., description="Low, Medium, High")
    reason: str = Field(..., description="E.g., High self-claimed proficiency but no actual projects")
    evidence: List[str] = Field(default_factory=list)

class RiskAssessment(BaseModel):
    technical: float = Field(..., ge=0.0, le=1.0)
    experience: float = Field(..., ge=0.0, le=1.0)
    timeline: float = Field(..., ge=0.0, le=1.0)
    resume_quality: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)

class EvaluationReport(BaseModel):
    candidate_id: str
    job_id: str
    
    metadata: EvaluationMetadata
    trace: List[EvaluationTrace] = Field(default_factory=list)
    
    # Dynamic evaluation dimensions mapping
    dimensions: Dict[str, EvaluationDimensionScore] = Field(..., description="Dynamic evaluation dimensions")
    
    conflicts: List[EvaluationConflict] = Field(default_factory=list)
    risks: RiskAssessment
    recommendation: RecommendationOpinion
    
    overall_reasoning: str = Field(..., description="Synthesized rationale across all dimensions")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Global evaluator confidence score")
    total_duration_ms: int = Field(..., description="Total time taken for evaluation")

class EvaluationSummary(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=1.0)
    recommendation: RecommendationOpinion
    confidence: float = Field(..., ge=0.0, le=1.0)
    top_strengths: List[str] = Field(default_factory=list)
    top_gaps: List[str] = Field(default_factory=list)
