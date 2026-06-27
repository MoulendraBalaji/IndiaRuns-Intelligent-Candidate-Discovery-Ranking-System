from typing import Dict, Type
from .base import FeaturePipeline
from .skill import SkillPipeline
from .career import CareerPipeline
from .project import ProjectPipeline
from .growth import GrowthPipeline
from .authenticity import AuthenticityPipeline
from .quality import QualityPipeline
from .timeline import TimelinePipeline

class PipelineRegistry:
    """
    Registry that auto-discovers or maps the deterministic pipelines.
    """
    _pipelines: Dict[str, Type[FeaturePipeline]] = {
        "skill_depth": SkillPipeline,
        "career_progression": CareerPipeline,
        "project_complexity": ProjectPipeline,
        "growth": GrowthPipeline,
        "authenticity": AuthenticityPipeline,
        "quality": QualityPipeline,
        "timeline": TimelinePipeline
    }
    
    @classmethod
    def get_all_instances(cls) -> Dict[str, FeaturePipeline]:
        """
        Returns an instantiated dict of all active pipelines.
        """
        return {key: pipe_class() for key, pipe_class in cls._pipelines.items()}
