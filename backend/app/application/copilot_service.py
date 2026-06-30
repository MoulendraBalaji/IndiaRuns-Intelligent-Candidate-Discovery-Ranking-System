import logging
from typing import List, Dict
from app.schemas.agent import AgentRequest
from app.agents.copilot.agent import CopilotAgent
from app.infrastructure.repositories.matching_repo import MatchingRepository

logger = logging.getLogger(__name__)

class CopilotService:
    def __init__(self, matching_repo: MatchingRepository):
        self.matching_repo = matching_repo
        self.agent = CopilotAgent()

    async def execute_query(
        self,
        tenant_id: str,
        job_id: str,
        query: str,
        history: List[Dict[str, str]]
    ) -> dict:
        """Runs copilot query with precomputed ranking results and reports for grounding context."""
        ranking_result = self.matching_repo.get_match_result(job_id)
        evaluation_reports = self.matching_repo.get_evaluation_reports(job_id)
        explain_reports = self.matching_repo.get_explainability_reports(job_id)
        
        # Structure the payload exactly like CopilotAgent expects
        payload = {
            "query": query,
            "history": history,
            "ranking_result": ranking_result.model_dump(mode="json") if ranking_result else None,
            "evaluation_reports": [er.model_dump(mode="json") for er in evaluation_reports],
            "explainability_reports": [er.model_dump(mode="json") for er in explain_reports]
        }
        
        req = AgentRequest(
            tenant_id=tenant_id,
            payload=payload
        )
        
        response = await self.agent.execute(req)
        if not response.success:
            raise ValueError(f"Copilot analysis failed: {response.error}")
            
        return response.data
