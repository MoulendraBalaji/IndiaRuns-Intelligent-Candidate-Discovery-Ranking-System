import asyncio
import time
import uuid
from typing import Dict, Any

from app.schemas.agent import AgentRequest, AgentResponse
from app.schemas.document import ResumeDocument

from .extractor.parser import CandidateParser
from .pipelines.registry import PipelineRegistry

from .builders.candidate_profile_builder import CandidateProfileBuilder
from .builders.candidate_feature_builder import CandidateFeatureBuilder

class CandidateIntelligenceAgent:
    """
    Orchestrates the LLM extraction and deterministic feature pipelines.
    """
    def __init__(self, api_key: str | None = None):
        self.parser = CandidateParser(api_key=api_key)
        self.pipelines = PipelineRegistry.get_all_instances()

    async def execute(self, request: AgentRequest) -> AgentResponse:
        start_time = time.time()
        
        try:
            # 1. Parse payload into ResumeDocument
            document = ResumeDocument(**request.payload)
            candidate_id = document.candidate_id or str(uuid.uuid4())
            
            # 2. Extract Entities via Gemini
            entities = await self.parser.parse(document)
            
            # 3. Fan out to all deterministic pipelines simultaneously
            pipeline_tasks = [
                pipe.process(entities) for pipe in self.pipelines.values()
            ]
            results = await asyncio.gather(*pipeline_tasks)
            
            # Map results back to their pipeline keys
            res_map = dict(zip(self.pipelines.keys(), results))
            
            # 4. Build Phase 1 Schemas
            features = CandidateFeatureBuilder.build(
                tenant_id=request.tenant_id,
                candidate_id=candidate_id,
                skill_res=res_map["skill_depth"],
                career_res=res_map["career_progression"],
                project_res=res_map["project_complexity"],
                growth_res=res_map["growth"],
                auth_res=res_map["authenticity"],
                timeline_res=res_map["timeline"]
            )
            
            quality_res = res_map["quality"]
            profile = CandidateProfileBuilder.build(
                tenant_id=request.tenant_id,
                candidate_id=candidate_id,
                entities=entities,
                quality_score=quality_res.value.get("completeness", 1.0) if isinstance(quality_res.value, dict) else 1.0
            )
            
            # 5. Compute overall confidence
            confidence_keys = ["skill_depth", "career_progression", "project_complexity", "growth", "authenticity", "timeline"]
            overall_confidence = sum([res_map[k].confidence for k in confidence_keys]) / len(confidence_keys)
            
            # Collect all warnings
            all_warnings = []
            for res in res_map.values():
                all_warnings.extend(res.warnings)
            
            payload = {
                "profile": profile.model_dump(mode="json"),
                "features": features.model_dump(mode="json"),
                "quality": quality_res.value
            }
            
            if all_warnings:
                payload["warnings"] = all_warnings
                
            latency = int((time.time() - start_time) * 1000)
            
            return AgentResponse(
                success=True,
                data=payload,
                processing_time_ms=latency,
                confidence_score=overall_confidence
            )
            
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            return AgentResponse(
                success=False,
                error=str(e),
                processing_time_ms=latency
            )
