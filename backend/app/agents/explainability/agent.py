import time
import json
import logging
from typing import Optional

from app.schemas.agent import AgentRequest, AgentResponse
from app.schemas.explainability import ExplanationContext, ExplanationDraft, ExplainabilityReport
from app.infrastructure.llm.gemini_client import GeminiClient
from .prompt_builder import ExplanationPromptBuilder
from .validator import DraftValidator
from .builders.explainability_report_builder import ExplainabilityReportBuilder

logger = logging.getLogger(__name__)

class ExplainabilityAgent:
    """
    Translates structured rankings and evaluation reports into 
    recruiter-friendly natural language justifications.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.client = GeminiClient(api_key=api_key)
        
    async def execute(self, request: AgentRequest) -> AgentResponse:
        start_time = time.time()
        
        try:
            # 1. Parse incoming context
            context_data = request.payload.get("context")
            if not context_data:
                raise ValueError("Missing explainability 'context' in payload.")
                
            context = ExplanationContext(**context_data)
            
            # 2. Build prompt context
            prompt_context = ExplanationPromptBuilder.build_prompt_context(context)
            
            # Load system instructions prompt
            prompt_loader_path = f"prompts/explainability/v1.md"
            with open(prompt_loader_path, "r", encoding="utf-8") as f:
                prompt_instructions = f.read()

            # 3. Request Gemini structure extraction for ExplanationDraft
            json_response = await self.client.generate_structured_extraction(
                prompt=prompt_instructions,
                text_input=prompt_context,
                response_schema=ExplanationDraft,
                use_cache=True
            )
            
            draft_data = json.loads(json_response)
            draft = ExplanationDraft(**draft_data)
            
            # 4. Validate comparison targets
            is_valid = DraftValidator.validate_draft(draft, context.ranking_result)
            if not is_valid:
                logger.warning("Explainability draft failed validation: comparison target mismatch.")
                # We could filter out invalid comparisons here, but for now we proceed
                # and flag it via a warning, or filter:
                draft.comparisons = [
                    c for c in draft.comparisons 
                    if c.compared_to_candidate_id in {r.candidate_id for r in context.ranking_result.rankings}
                ]
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            # 5. Build final report
            report = ExplainabilityReportBuilder.build(
                context=context,
                draft=draft,
                duration_ms=duration_ms,
                model_version="gemini-2.5-flash",
                prompt_version="v1"
            )
            
            payload = {
                "report": report.model_dump(mode="json")
            }
            
            return AgentResponse(
                success=True,
                data=payload,
                processing_time_ms=duration_ms,
                confidence_score=report.metadata.explanation_confidence
            )
            
        except Exception as e:
            logger.error(f"Explainability Agent Error: {e}")
            duration_ms = int((time.time() - start_time) * 1000)
            return AgentResponse(
                success=False,
                error=str(e),
                processing_time_ms=duration_ms
            )
