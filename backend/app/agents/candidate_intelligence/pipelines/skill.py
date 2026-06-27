import time
from app.schemas.pipeline import PipelineResult
from app.schemas.extraction import ExtractedEntities
from .base import FeaturePipeline

class SkillPipeline(FeaturePipeline):
    async def process(self, entities: ExtractedEntities) -> PipelineResult:
        start_time = time.time()
        warnings = []
        confidence = 1.0
        
        num_skills = len(entities.skills)
        if num_skills == 0:
            warnings.append("No skills extracted.")
            confidence = 0.5
            
        # Very naive deterministic scoring for now
        # Will be properly scaled in Feature Engineering layer
        raw_score = float(min(num_skills * 1.5, 100.0))
        
        return self._create_result(value=raw_score, confidence=confidence, warnings=warnings, start_time=start_time)
