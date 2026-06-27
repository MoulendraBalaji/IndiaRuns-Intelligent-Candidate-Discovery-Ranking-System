import time
from app.schemas.pipeline import PipelineResult, ResumeQuality
from app.schemas.extraction import ExtractedEntities
from .base import FeaturePipeline

class QualityPipeline(FeaturePipeline):
    async def process(self, entities: ExtractedEntities) -> PipelineResult:
        start_time = time.time()
        warnings = []
        confidence = 1.0
        
        missing = []
        if not entities.roles:
            missing.append("Roles")
        if not entities.projects:
            missing.append("Projects")
        if not entities.education:
            missing.append("Education")
            
        quality = ResumeQuality(
            completeness=1.0 if not missing else 0.5,
            clarity=0.8,
            ambiguity=0.2,
            missing_sections=missing
        )
        
        if missing:
            warnings.append(f"Missing sections: {', '.join(missing)}")
            
        return self._create_result(value=quality.model_dump(), confidence=confidence, warnings=warnings, start_time=start_time)
