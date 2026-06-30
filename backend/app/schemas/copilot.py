from typing import List
from pydantic import BaseModel, Field

class CopilotMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str

class CopilotSession(BaseModel):
    session_id: str
    history: List[CopilotMessage] = Field(default_factory=list)

class CopilotResponse(BaseModel):
    answer: str
    referenced_candidate_ids: List[str] = Field(default_factory=list)
    latency_ms: int
