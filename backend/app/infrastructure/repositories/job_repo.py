import os
import json
import logging
from typing import List, Optional
from app.schemas.job import JobProfile

logger = logging.getLogger(__name__)

class JobRepository:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        self.jobs_path = os.path.join(self.data_dir, "jobs.json")
        self._init_files()

    def _init_files(self):
        if not os.path.exists(self.jobs_path):
            with open(self.jobs_path, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def _load_dict(self) -> dict:
        try:
            with open(self.jobs_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading jobs repository: {e}")
            return {}

    def _save_dict(self, data: dict):
        try:
            with open(self.jobs_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving jobs repository: {e}")

    def save_job(self, job: JobProfile):
        data = self._load_dict()
        data[job.id] = job.model_dump(mode="json")
        self._save_dict(data)
        logger.info(f"Saved job profile {job.id}")

    def get_job(self, job_id: str) -> Optional[JobProfile]:
        data = self._load_dict()
        job_data = data.get(job_id)
        if job_data:
            return JobProfile(**job_data)
        return None

    def list_jobs(self) -> List[JobProfile]:
        data = self._load_dict()
        return [JobProfile(**j) for j in data.values()]
