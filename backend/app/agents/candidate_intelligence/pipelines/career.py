import time
from app.schemas.pipeline import PipelineResult
from app.schemas.extraction import ExtractedEntities
from .base import FeaturePipeline

class CareerPipeline(FeaturePipeline):
    async def process(self, entities: ExtractedEntities) -> PipelineResult:
        start_time = time.time()
        warnings = []
        confidence = 1.0
        
        num_roles = len(entities.roles)
        if num_roles == 0:
            warnings.append("No career history extracted.")
            confidence = 0.6
            
        raw_score = num_roles * 10.0
        
        return self._create_result(value=raw_score, confidence=confidence, warnings=warnings, start_time=start_time)
