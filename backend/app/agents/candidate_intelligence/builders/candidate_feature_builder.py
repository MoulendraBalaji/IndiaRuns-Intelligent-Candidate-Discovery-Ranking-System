from app.schemas.feature_store import CandidateFeatures
from app.ml.feature_engineering.candidate import CandidateFeatureEngineer
from app.schemas.pipeline import PipelineResult
from .base import Builder

class CandidateFeatureBuilder(Builder):
    @staticmethod
    def build(
        tenant_id: str,
        candidate_id: str,
        skill_res: PipelineResult,
        career_res: PipelineResult,
        project_res: PipelineResult,
        growth_res: PipelineResult,
        auth_res: PipelineResult,
        timeline_res: PipelineResult
    ) -> CandidateFeatures:
        """
        Delegates the heavy lifting to the ML feature engineering layer
        to return the final CandidateFeatures schema.
        """
        return CandidateFeatureEngineer.engineer_features(
            candidate_id=candidate_id,
            tenant_id=tenant_id,
            skill_result=skill_res,
            career_result=career_res,
            project_result=project_res,
            growth_result=growth_res,
            authenticity_result=auth_res,
            timeline_result=timeline_res
        )
