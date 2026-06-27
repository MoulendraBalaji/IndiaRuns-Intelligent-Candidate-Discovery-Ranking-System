from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List
from app.schemas.candidate import CandidateProfile
from .dependencies import candidate_service

router = APIRouter()

@router.post("/upload", response_model=CandidateProfile, status_code=201)
async def upload_candidate_resume(
    file: UploadFile = File(...),
    tenant_id: str = Form("default_tenant")
):
    try:
        content = await file.read()
        profile = await candidate_service.upload_resume(
            tenant_id=tenant_id,
            filename=file.filename,
            file_bytes=content
        )
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@router.get("", response_model=List[CandidateProfile])
def list_candidates():
    return candidate_service.list_candidates()

@router.get("/{candidate_id}", response_model=CandidateProfile)
def get_candidate(candidate_id: str):
    profile = candidate_service.get_candidate(candidate_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return profile
