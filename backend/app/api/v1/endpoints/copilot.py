from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.schemas.copilot import CopilotResponse
from .dependencies import copilot_service

router = APIRouter()

class CopilotChatRequest(BaseModel):
    query: str
    history: List[Dict[str, str]] = []
    job_id: str
    tenant_id: str = "default_tenant"

@router.post("/chat", response_model=CopilotResponse)
async def chat_with_copilot(payload: CopilotChatRequest):
    try:
        res = await copilot_service.execute_query(
            tenant_id=payload.tenant_id,
            job_id=payload.job_id,
            query=payload.query,
            history=payload.history
        )
        return CopilotResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot query failed: {str(e)}")
