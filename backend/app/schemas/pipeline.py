from typing import Any, List
from pydantic import BaseModel, Field

class PipelineResult(BaseModel):
    """
    Standard output contract for all deterministic Feature Pipelines.
    """
    value: Any = Field(..., description="The computed value (e.g., float for score, dict for quality)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in this pipeline's computation")
    warnings: List[str] = Field(default_factory=list, description="Warnings (e.g., missing dates, OCR noise)")
    latency_ms: int = Field(0, description="Execution latency in ms")
    version: str = Field("1.0", description="Pipeline version string")

class ResumeQuality(BaseModel):
    """
    Result schema for the Resume Quality Pipeline.
    """
    completeness: float = Field(..., ge=0.0, le=1.0)
    clarity: float = Field(..., ge=0.0, le=1.0)
    ambiguity: float = Field(..., ge=0.0, le=1.0)
    missing_sections: List[str] = Field(default_factory=list)
