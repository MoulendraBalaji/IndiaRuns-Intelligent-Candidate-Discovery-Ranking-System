import time
from app.schemas.pipeline import PipelineResult
from app.schemas.extraction import ExtractedEntities
from .base import FeaturePipeline

class TimelinePipeline(FeaturePipeline):
    PIPELINE_VERSION = "1.0.0"
    
    async def process(self, entities: ExtractedEntities) -> PipelineResult:
        start_time = time.time()
        warnings = []
        confidence = 1.0
        
        # Output is a dict with consistency, gaps, overlaps
        # For now, a naive deterministic representation
        value = {
            "consistency": 1.0,
            "gaps": [],
            "overlaps": []
        }
        
        if not entities.roles:
            warnings.append("No roles to evaluate timeline.")
            confidence = 0.5
            value["consistency"] = 0.0
            
        return self._create_result(value=value, confidence=confidence, warnings=warnings, start_time=start_time)
