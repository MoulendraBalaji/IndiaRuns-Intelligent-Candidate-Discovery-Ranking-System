import time
from app.schemas.pipeline import PipelineResult
from app.schemas.extraction import ExtractedEntities
from .base import FeaturePipeline

class GrowthPipeline(FeaturePipeline):
    async def process(self, entities: ExtractedEntities) -> PipelineResult:
        start_time = time.time()
        warnings = []
        confidence = 1.0
        
        # Naive computation based on roles and skills
        raw_score = 50.0
        if len(entities.skills) > 5 and len(entities.roles) > 1:
            raw_score = 75.0
            
        return self._create_result(value=raw_score, confidence=confidence, warnings=warnings, start_time=start_time)
