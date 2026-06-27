from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.schemas.job import JobProfile
from .dependencies import job_service

router = APIRouter()

class JobCreate(BaseModel):
    title: str
    raw_jd: str
    role_type: str = "BACKEND_ENGINEER"
    tenant_id: str = "default_tenant"

@router.post("", response_model=JobProfile, status_code=201)
async def create_job(payload: JobCreate):
    try:
        profile = await job_service.create_job(
            tenant_id=payload.tenant_id,
            title=payload.title,
            raw_jd=payload.raw_jd,
            role_type=payload.role_type
        )
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze job description: {str(e)}")

@router.get("", response_model=List[JobProfile])
def list_jobs():
    return job_service.list_jobs()

@router.get("/{job_id}", response_model=JobProfile)
def get_job(job_id: str):
    profile = job_service.get_job(job_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Job not found")
    return profile
