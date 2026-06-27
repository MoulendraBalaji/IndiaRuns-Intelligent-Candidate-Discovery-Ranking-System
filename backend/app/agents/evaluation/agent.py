import time
import os
import json
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path

from app.schemas.agent import AgentRequest, AgentResponse
from app.schemas.evaluation import EvaluationContext, EvaluationReport, EvaluationMetadata, EvaluationSummary
from app.infrastructure.llm.gemini_client import GeminiClient
from app.ml.registry.evaluation_dimensions import ROLE_PROFILES, DIMENSION_METADATA

logger = logging.getLogger(__name__)

class EvaluationPromptLoader:
    def __init__(self, base_dir: str = "prompts"):
        self.base_dir = Path(os.getcwd()) / base_dir

    def load_prompt(self, domain: str, version: str) -> str:
        prompt_path = self.base_dir / domain / f"{version}.md"
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()

class EvaluationAgent:
    """
    Evaluates a candidate's profile/features against a job profile
    using dynamic role-specific dimension weights from the registry.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.client = GeminiClient(api_key=api_key)
        self.prompt_loader = EvaluationPromptLoader()

    async def execute(self, request: AgentRequest, role_profile_key: str = "BACKEND_ENGINEER") -> AgentResponse:
        start_time = time.time()
        
        try:
            # 1. Parse incoming context
            context_data = request.payload.get("context")
            if not context_data:
                raise ValueError("Missing evaluation 'context' in payload.")
                
            context = EvaluationContext(**context_data)
            
            # 2. Get role profile & normalize weights
            role_profile = ROLE_PROFILES.get(role_profile_key)
            if not role_profile:
                raise ValueError(f"Unknown role profile: {role_profile_key}")
                
            normalized_weights = role_profile.get_normalized_weights()
            
            # 3. Load prompt and format inputs
            prompt = self.prompt_loader.load_prompt("evaluation", "v1")
            
            # Format inputs to LLM excluding raw textual noise, keeping it strictly structured
            inputs = {
                "job_profile": context.job_profile.model_dump(mode="json"),
                "candidate_profile": {
                    "education": [e.model_dump() for e in context.candidate_profile.education],
                    "experience": [
                        {
                            "title": r.title,
                            "company": r.company,
                            "duration_months": r.duration_months,
                            "technologies": r.technologies
                        }
                        for r in context.candidate_profile.experience
                    ],
                    "hard_skills": context.candidate_profile.hard_skills,
                    "soft_skills": context.candidate_profile.soft_skills,
                    "total_years_experience": context.candidate_profile.total_years_experience
                },
                "candidate_features": context.candidate_features.model_dump(mode="json"),
                "retrieval_result": context.retrieval_result.model_dump(mode="json"),
                "dimension_weights": normalized_weights
            }
            
            # 4. Generate structured report via Gemini 2.5 Flash
            json_response = await self.client.generate_structured_extraction(
                prompt=prompt,
                text_input=json.dumps(inputs, indent=2),
                response_schema=EvaluationReport,
                use_cache=True
            )
            
            # 5. Load and populate additional metrics / metadata
            report_data = json.loads(json_response)
            
            # Overwrite metadata values to guarantee runtime synchronization
            total_duration = int((time.time() - start_time) * 1000)
            report_data["total_duration_ms"] = total_duration
            
            report_data["metadata"] = EvaluationMetadata(
                evaluator_model="gemini-2.5-flash",
                prompt_version="v1",
                pipeline_version="1.0.0",
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                schema_version="1.0.0"
            ).model_dump(mode="json")
            
            # Sync dimension IDs and weights exactly from our registry to avoid LLM deviation
            for dim_id, score_data in report_data.get("dimensions", {}).items():
                score_data["id"] = dim_id
                score_data["weight"] = normalized_weights.get(dim_id, 0.0)
                
            report = EvaluationReport(**report_data)
            
            # 6. Build the lightweight EvaluationSummary for quick queries
            # overall score = sum(dimension score * normalized weight)
            overall_score = sum(
                dim.score * dim.weight 
                for dim in report.dimensions.values()
            )
            
            # Extract strengths and gaps
            strengths = []
            gaps = []
            for dim in report.dimensions.values():
                for ev in dim.evidence:
                    if ev.strength >= 0.7:
                        strengths.append(ev.fact)
                    elif ev.strength <= 0.4:
                        gaps.append(ev.fact)
                        
            summary = EvaluationSummary(
                overall_score=min(max(overall_score, 0.0), 1.0),
                recommendation=report.recommendation,
                confidence=report.confidence,
                top_strengths=strengths[:3],
                top_gaps=gaps[:3]
            )
            
            payload = {
                "report": report.model_dump(mode="json"),
                "summary": summary.model_dump(mode="json")
            }
            
            return AgentResponse(
                success=True,
                data=payload,
                processing_time_ms=total_duration,
                confidence_score=report.confidence
            )
            
        except Exception as e:
            logger.error(f"Evaluation Agent Error: {e}")
            total_duration = int((time.time() - start_time) * 1000)
            return AgentResponse(
                success=False,
                error=str(e),
                processing_time_ms=total_duration
            )
