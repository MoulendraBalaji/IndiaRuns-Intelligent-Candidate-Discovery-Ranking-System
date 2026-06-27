import os
import json
import logging
from typing import List, Dict, Optional, Any
from app.schemas.evaluation import EvaluationReport
from app.schemas.ranking import RankingResult
from app.schemas.explainability import ExplainabilityReport

logger = logging.getLogger(__name__)

class MatchingRepository:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        self.tasks_path = os.path.join(self.data_dir, "matching_tasks.json")
        self.results_path = os.path.join(self.data_dir, "matching_results.json")
        self.evals_path = os.path.join(self.data_dir, "evaluation_reports.json")
        self.explanations_path = os.path.join(self.data_dir, "explainability_reports.json")
        self._init_files()

    def _init_files(self):
        for path in [self.tasks_path, self.results_path, self.evals_path, self.explanations_path]:
            if not os.path.exists(path):
                with open(path, "w", encoding="utf-8") as f:
                    json.dump({}, f)

    def _load_dict(self, path: str) -> dict:
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading {path}: {e}")
            return {}

    def _save_dict(self, path: str, data: dict):
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving {path}: {e}")

    def save_task(self, task_id: str, status: str, result: Optional[dict] = None, error: Optional[str] = None):
        data = self._load_dict(self.tasks_path)
        data[task_id] = {
            "task_id": task_id,
            "status": status,
            "result": result,
            "error": error
        }
        self._save_dict(self.tasks_path, data)
        logger.info(f"Saved task {task_id} with status {status}")

    def get_task(self, task_id: str) -> Optional[dict]:
        data = self._load_dict(self.tasks_path)
        return data.get(task_id)

    def save_match_result(self, job_id: str, result: RankingResult):
        data = self._load_dict(self.results_path)
        data[job_id] = result.model_dump(mode="json")
        self._save_dict(self.results_path, data)
        logger.info(f"Saved match ranking result for job {job_id}")

    def get_match_result(self, job_id: str) -> Optional[RankingResult]:
        data = self._load_dict(self.results_path)
        res = data.get(job_id)
        if res:
            return RankingResult(**res)
        return None

    def save_evaluation_reports(self, job_id: str, reports: List[EvaluationReport]):
        data = self._load_dict(self.evals_path)
        data[job_id] = [r.model_dump(mode="json") for r in reports]
        self._save_dict(self.evals_path, data)
        logger.info(f"Saved {len(reports)} evaluations for job {job_id}")

    def get_evaluation_reports(self, job_id: str) -> List[EvaluationReport]:
        data = self._load_dict(self.evals_path)
        reports_data = data.get(job_id, [])
        return [EvaluationReport(**r) for r in reports_data]

    def save_explainability_reports(self, job_id: str, reports: List[ExplainabilityReport]):
        data = self._load_dict(self.explanations_path)
        data[job_id] = [r.model_dump(mode="json") for r in reports]
        self._save_dict(self.explanations_path, data)
        logger.info(f"Saved {len(reports)} explainability reports for job {job_id}")

    def get_explainability_reports(self, job_id: str) -> List[ExplainabilityReport]:
        data = self._load_dict(self.explanations_path)
        reports_data = data.get(job_id, [])
        return [ExplainabilityReport(**r) for r in reports_data]
