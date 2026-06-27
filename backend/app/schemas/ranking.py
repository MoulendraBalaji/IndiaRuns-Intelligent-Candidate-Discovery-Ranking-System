from typing import List, Optional
from pydantic import BaseModel, Field

class CandidateRank(BaseModel):
    candidate_id: str
    job_id: str
    final_score: float = Field(..., ge=0.0, le=1.0, description="The mathematically computed final score")
    rank_position: int = Field(..., description="The cohort rank")
    passed_gates: bool = Field(..., description="True if candidate met all minimum thresholds")
    failed_dimensions: List[str] = Field(default_factory=list, description="List of dimensions where thresholds failed")

class RankingResult(BaseModel):
    job_id: str
    rankings: List[CandidateRank] = Field(default_factory=list)
    total_ranked: int
    metadata: dict = Field(default_factory=dict)
