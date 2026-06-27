from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class AgentRequest(BaseModel):
    """
    Standardized input contract for all Agents in the system.
    """
    tenant_id: str = Field(..., description="Tenant ID for RLS")
    payload: Dict[str, Any] = Field(..., description="The input data (e.g., resume text, job description)")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional metadata (e.g., session ID, user ID)")

class AgentResponse(BaseModel):
    """
    Standardized output contract for all Agents in the system.
    """
    success: bool = Field(..., description="Whether the agent execution was successful")
    data: Optional[Dict[str, Any]] = Field(None, description="The output payload (e.g., parsed profile JSON)")
    error: Optional[str] = Field(None, description="Error message if success is false")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Confidence score of the extraction/evaluation")
    processing_time_ms: int = Field(..., description="Latency of the agent execution in milliseconds")
    tokens_used: Optional[int] = Field(None, description="LLM tokens consumed (if applicable)")
