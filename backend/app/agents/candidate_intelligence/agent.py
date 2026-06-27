import asyncio
import time
import uuid
from typing import Dict, Any

from app.schemas.agent import AgentRequest, AgentResponse
from app.schemas.document import ResumeDocument

from .extractor.parser import CandidateParser
from .pipelines.skill import SkillPipeline
from .pipelines.career import CareerPipeline
from .pipelines.project import ProjectPipeline
from .pipelines.growth import GrowthPipeline
from .pipelines.authenticity import AuthenticityPipeline
from .pipelines.quality import QualityPipeline

from .builders.candidate_profile_builder import CandidateProfileBuilder
from .builders.candidate_feature_builder import CandidateFeatureBuilder

class CandidateIntelligenceAgent:
    """
    Orchestrates the LLM extraction and deterministic feature pipelines.
    """
    def __init__(self, api_key: str = None):
        self.parser = CandidateParser(api_key=api_key)
        
        # Initialize pipelines
        self.skill_pipe = SkillPipeline()
        self.career_pipe = CareerPipeline()
        self.project_pipe = ProjectPipeline()
        self.growth_pipe = GrowthPipeline()
        self.auth_pipe = AuthenticityPipeline()
        self.quality_pipe = QualityPipeline()

    async def execute(self, request: AgentRequest) -> AgentResponse:
        start_time = time.time()
        
        try:
            # 1. Parse payload into ResumeDocument
            document = ResumeDocument(**request.payload)
            candidate_id = document.candidate_id or str(uuid.uuid4())
            
            # 2. Extract Entities via Gemini
            entities = await self.parser.parse(document)
            
            # 3. Fan out to all deterministic pipelines simultaneously
            results = await asyncio.gather(
                self.skill_pipe.process(entities),
                self.career_pipe.process(entities),
                self.project_pipe.process(entities),
                self.growth_pipe.process(entities),
                self.auth_pipe.process(entities),
                self.quality_pipe.process(entities)
            )
            
            skill_res, career_res, project_res, growth_res, auth_res, quality_res = results
            
            # 4. Build Phase 1 Schemas
            features = CandidateFeatureBuilder.build(
                tenant_id=request.tenant_id,
                candidate_id=candidate_id,
                skill_res=skill_res,
                career_res=career_res,
                project_res=project_res,
                growth_res=growth_res,
                auth_res=auth_res
            )
            
            profile = CandidateProfileBuilder.build(
                tenant_id=request.tenant_id,
                candidate_id=candidate_id,
                entities=entities,
                quality_score=quality_res.value.get("completeness", 1.0) if isinstance(quality_res.value, dict) else 1.0
            )
            
            # 5. Compute overall confidence
            overall_confidence = sum([
                skill_res.confidence, career_res.confidence, 
                project_res.confidence, growth_res.confidence, auth_res.confidence
            ]) / 5.0
            
            # Collect all warnings
            all_warnings = (
                skill_res.warnings + career_res.warnings + 
                project_res.warnings + growth_res.warnings + 
                auth_res.warnings + quality_res.warnings
            )
            
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
