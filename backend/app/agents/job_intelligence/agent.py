import time
import uuid
import logging
from typing import Dict

from app.schemas.agent import AgentRequest, AgentResponse
from app.schemas.job_document import JobDocument
from app.schemas.job import Capability

from .extractor.parser import JobParser
from .pipelines.requirement_classifier import RequirementClassifier
from .pipelines.job_complexity import JobComplexityScorer
from app.ml.ontology.skill_graph import SkillGraph
from app.ml.ontology.capability_graph import CapabilityGraph
from app.ml.ontology.role_taxonomy import RoleTaxonomyMapper
from .builders.job_profile_builder import JobProfileBuilder

logger = logging.getLogger(__name__)

class JobIntelligenceAgent:
    """
    Orchestrates the LLM extraction, classification, ontology mapping, and job profile building.
    Implements a simple in-memory cache at the agent level for identical JDs.
    """
    _job_cache: Dict[str, dict] = {}
    
    def __init__(self, api_key: str | None = None):
        self.parser = JobParser(api_key=api_key)

    async def execute(self, request: AgentRequest) -> AgentResponse:
        start_time = time.time()
        
        try:
            document = JobDocument(**request.payload)
            job_id = document.job_id or str(uuid.uuid4())
            
            # 1. Agent-level caching
            if document.hash in self._job_cache:
                latency = int((time.time() - start_time) * 1000)
                cached_data = self._job_cache[document.hash]
                return AgentResponse(
                    success=True,
                    data=cached_data,
                    processing_time_ms=latency,
                    confidence_score=1.0 # Cache hit
                )
            
            # 2. Extract Entities via Gemini
            entities = await self.parser.parse(document)
            
            # 3. Requirement Classification
            requirements = RequirementClassifier.classify(entities)
            
            # 4. Ontology Mapping
            # 4a. Skill Graph Expansion
            for req in requirements:
                if req.category == "technical_skill":
                    expanded = SkillGraph.expand_skill(req.text)
                    # We could add the expanded skills as new requirements or replace.
                    # For simplicity, we just keep the canonical name or original if not found.
                    if expanded:
                        req.text = expanded[0]
            
            # 4b. Capability Graph
            raw_tasks = entities.responsibilities
            cap_names = CapabilityGraph.derive_capabilities(raw_tasks)
            capabilities = [Capability(name=c, importance=0.9) for c in cap_names]
            
            # 4c. Role Taxonomy
            taxonomy = RoleTaxonomyMapper.map_title(entities.title)
            
            # 5. Job Complexity Scoring
            complexity = JobComplexityScorer.score(entities)
            
            # 6. Builder Layer
            metadata = {
                "pipeline_version": "1.0",
                "prompt_version": "v1",
                "ontology_version": "1.0",
                "llm_model": "gemini-2.5-flash"
            }
            
            profile = JobProfileBuilder.build(
                tenant_id=request.tenant_id,
                job_id=job_id,
                entities=entities,
                requirements=requirements,
                capabilities=capabilities,
                taxonomy=taxonomy,
                complexity_score=complexity,
                metadata=metadata
            )
            
            payload = {
                "profile": profile.model_dump(mode="json")
            }
            
            # Cache the final payload
            self._job_cache[document.hash] = payload
            
            latency = int((time.time() - start_time) * 1000)
            
            return AgentResponse(
                success=True,
                data=payload,
                processing_time_ms=latency,
                confidence_score=0.95
            )
            
        except Exception as e:
            logger.error(f"Job Agent Error: {e}")
            latency = int((time.time() - start_time) * 1000)
            return AgentResponse(
                success=False,
                error=str(e),
                processing_time_ms=latency
            )
