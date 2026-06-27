import time
import json
import logging
from typing import Dict, List, Optional
from google import genai
from google.genai import types

from app.schemas.agent import AgentRequest, AgentResponse
from app.schemas.copilot import CopilotResponse, CopilotMessage
from app.infrastructure.llm.gemini_client import GeminiClient

logger = logging.getLogger(__name__)

class CopilotAgent:
    """
    Recruiter Copilot. Provides interactive QA over precomputed ranking results, 
    evaluation reports, and explainability reports.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.client = GeminiClient(api_key=api_key)
        
    async def execute(self, request: AgentRequest) -> AgentResponse:
        start_time = time.time()
        
        try:
            # 1. Parse payload
            query = request.payload.get("query")
            if not query:
                raise ValueError("Missing 'query' in payload.")
                
            history_data = request.payload.get("history", [])
            history = [CopilotMessage(**m) for m in history_data]
            
            # Context reports (optional but recommended for factual grounding)
            ranking_result = request.payload.get("ranking_result")
            evaluation_reports = request.payload.get("evaluation_reports", [])
            explainability_reports = request.payload.get("explainability_reports", [])
            
            # 2. Build prompt context
            context_summary = {
                "ranking_result": ranking_result,
                "evaluation_reports": evaluation_reports,
                "explainability_reports": explainability_reports
            }
            
            # Load system instructions
            prompt_loader_path = f"prompts/copilot/v1.md"
            with open(prompt_loader_path, "r", encoding="utf-8") as f:
                system_instruction = f.read()
                
            # We pass history + context + query
            full_prompt = f"{system_instruction}\n\nCONTEXT DATA:\n{json.dumps(context_summary, indent=2)}\n\n"
            
            if history:
                full_prompt += "CHAT HISTORY:\n"
                for msg in history:
                    full_prompt += f"{msg.role}: {msg.content}\n"
                full_prompt += "\n"
                
            full_prompt += f"USER QUERY: {query}\n"
            
            # 3. Call Gemini to generate explanation response (plain text response since it's conversational)
            # Gemini client generate_structured_extraction could be used, but since the copilot 
            # output is open-ended chat text, we call the client directly.
            response = self.client.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2, # Factual grounding focus
                )
            )
            
            answer = response.text or ""
            
            # 4. Heuristic: detect referenced candidate IDs in the response
            referenced_ids = []
            if ranking_result:
                for candidate in ranking_result.get("rankings", []):
                    c_id = candidate.get("candidate_id")
                    if c_id and c_id in answer:
                        referenced_ids.append(c_id)
                        
            latency = int((time.time() - start_time) * 1000)
            
            copilot_res = CopilotResponse(
                answer=answer,
                referenced_candidate_ids=referenced_ids,
                latency_ms=latency
            )
            
            return AgentResponse(
                success=True,
                data=copilot_res.model_dump(mode="json"),
                processing_time_ms=latency,
                confidence_score=0.95
            )
            
        except Exception as e:
            logger.error(f"Copilot Agent Error: {e}")
            latency = int((time.time() - start_time) * 1000)
            return AgentResponse(
                success=False,
                error=str(e),
                processing_time_ms=latency
            )
