import uuid
import logging
from typing import List, Optional
from app.schemas.job import JobProfile
from app.schemas.agent import AgentRequest
from app.agents.job_intelligence.agent import JobIntelligenceAgent
from app.infrastructure.repositories.job_repo import JobRepository

logger = logging.getLogger(__name__)

class JobService:
    def __init__(self, job_repo: JobRepository):
        self.job_repo = job_repo
        self.agent = JobIntelligenceAgent()

    async def create_job(self, tenant_id: str, title: str, raw_jd: str, role_type: str = "BACKEND_ENGINEER") -> JobProfile:
        job_id = str(uuid.uuid4())
        
        # Prepare request for agent
        req = AgentRequest(
            tenant_id=tenant_id,
            payload={
                "tenant_id": tenant_id,
                "job_id": job_id,
                "raw_text": raw_jd,
                "metadata": {
                    "title": title,
                    "role_type": role_type
                }
            }
        )
        
        # Execute JobIntelligenceAgent
        response = await self.agent.execute(req)
        if not response.success:
            raise ValueError(f"Job Description analysis failed: {response.error}")
            
        data = response.data
        
        # Build and save JobProfile
        profile_data = data["profile"]
        profile_data["id"] = job_id
        profile_data["tenant_id"] = tenant_id
        
        # Make sure role_type is stored
        profile_data["role_type"] = role_type
        
        # Wait, check if fields match JobProfile schema
        # In schemas/job.py: JobProfile has tenant_id, id, title, summary, mandatory_skills, preferred_skills, total_years_experience
        profile = JobProfile(**profile_data)
        self.job_repo.save_job(profile)
        
        return profile

    def get_job(self, job_id: str) -> Optional[JobProfile]:
        return self.job_repo.get_job(job_id)

    def list_jobs(self) -> List[JobProfile]:
        return self.job_repo.list_jobs()
