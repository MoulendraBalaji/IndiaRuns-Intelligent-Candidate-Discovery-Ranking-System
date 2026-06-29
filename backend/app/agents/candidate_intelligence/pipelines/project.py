import time
from app.schemas.pipeline import PipelineResult
from app.schemas.extraction import ExtractedEntities
from .base import FeaturePipeline

class ProjectPipeline(FeaturePipeline):
    async def process(self, entities: ExtractedEntities) -> PipelineResult:
        start_time = time.time()
        warnings = []
        confidence = 1.0
        
        num_projects = len(entities.projects)
        if num_projects == 0:
            warnings.append("No projects extracted.")
            confidence = 0.8
            
        raw_score = num_projects * 5.0
        
        return self._create_result(value=raw_score, confidence=confidence, warnings=warnings, start_time=start_time)
