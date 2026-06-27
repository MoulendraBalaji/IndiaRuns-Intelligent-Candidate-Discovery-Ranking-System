import time
from app.schemas.pipeline import PipelineResult
from app.schemas.extraction import ExtractedEntities
from .base import FeaturePipeline

class AuthenticityPipeline(FeaturePipeline):
    async def process(self, entities: ExtractedEntities) -> PipelineResult:
        start_time = time.time()
        warnings = []
        confidence = 1.0
        
        # Naive implementation
        raw_score = 90.0
        if not entities.roles and not entities.education:
            warnings.append("Lacks both education and experience.")
            raw_score = 40.0
            
        return self._create_result(value=raw_score, confidence=confidence, warnings=warnings, start_time=start_time)
