import time
from abc import ABC, abstractmethod
from app.schemas.pipeline import PipelineResult
from app.schemas.extraction import ExtractedEntities

class FeaturePipeline(ABC):
    """
    Base contract for all deterministic feature pipelines.
    """
    PIPELINE_VERSION: str = "1.0.0"
    
    @abstractmethod
    async def process(self, entities: ExtractedEntities) -> PipelineResult:
        """
        Processes the extracted entities and returns a standardized PipelineResult.
        """
        pass
    
    def _create_result(self, value: float | dict, confidence: float, warnings: list[str], start_time: float) -> PipelineResult:
        latency = int((time.time() - start_time) * 1000)
        return PipelineResult(
            value=value,
            confidence=confidence,
            warnings=warnings,
            latency_ms=latency,
            version=self.PIPELINE_VERSION
        )
