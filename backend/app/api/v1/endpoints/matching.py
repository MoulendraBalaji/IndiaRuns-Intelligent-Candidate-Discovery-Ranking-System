from fastapi import APIRouter, HTTPException, Query, Response
from pydantic import BaseModel
from typing import Dict, Any, Optional
from .dependencies import matching_service

router = APIRouter()

class MatchResponse(BaseModel):
    task_id: str
    status: str

class ReRankRequest(BaseModel):
    weights: Dict[str, float]

@router.post("/jobs/{job_id}/match", response_model=MatchResponse, status_code=202)
async def start_matching(
    job_id: str,
    limit: int = 10,
    k: int = 100
):
    try:
        task_id = await matching_service.start_matching(job_id=job_id, limit=limit, k=k)
        return MatchResponse(task_id=task_id, status="PENDING")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    task = matching_service.get_task_status(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/jobs/{job_id}/results")
def get_match_results(job_id: str):
    results = matching_service.get_match_result(job_id)
    if not results:
        raise HTTPException(status_code=404, detail="Match results not found for this job")
    return results

@router.post("/jobs/{job_id}/re-rank")
def re_rank_candidates(job_id: str, payload: ReRankRequest):
    try:
        results = matching_service.re_rank(job_id, payload.weights)
        return results
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_id}/export")
def export_ranked_submission(
    job_id: str,
    format: str = Query(default="csv", pattern="^(csv)$"),
    top_n: int = Query(default=100, ge=1, le=100),
):
    try:
        export = matching_service.export_submission_csv(job_id=job_id, top_n=top_n)
        return Response(
            content=export["csv_content"],
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="{export["filename"]}"'
            },
        )
    except ValueError as val_err:
        raise HTTPException(status_code=404, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
