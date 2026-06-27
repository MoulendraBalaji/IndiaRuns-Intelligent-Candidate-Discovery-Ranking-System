from app.schemas.pipeline import PipelineResult
from app.schemas.feature_store import CandidateFeatures
from .normalizer import Normalizer
from .scaler import Scaler

class CandidateFeatureEngineer:
    @staticmethod
    def engineer_features(
        candidate_id: str,
        tenant_id: str,
        skill_result: PipelineResult,
        career_result: PipelineResult,
        project_result: PipelineResult,
        growth_result: PipelineResult,
        authenticity_result: PipelineResult
    ) -> CandidateFeatures:
        """
        Transforms raw pipeline results into scaled, normalized features for the Feature Store.
        """
        
        # Skill: Max expected raw is 100
        raw_skill = float(skill_result.value)
        norm_skill = Normalizer.normalize_score(raw_skill, 0.0, 100.0)
        final_skill = Scaler.scale_confidence(norm_skill, skill_result.confidence)
        
        # Career: Max expected raw is 50
        raw_career = float(career_result.value)
        norm_career = Normalizer.normalize_score(raw_career, 0.0, 50.0)
        final_career = Scaler.scale_confidence(norm_career, career_result.confidence)
        
        # Project: Max expected raw is 40
        raw_project = float(project_result.value)
        norm_project = Normalizer.normalize_score(raw_project, 0.0, 40.0)
        final_project = Scaler.scale_confidence(norm_project, project_result.confidence)
        
        # Growth: Max expected raw is 100
        raw_growth = float(growth_result.value)
        norm_growth = Normalizer.normalize_score(raw_growth, 0.0, 100.0)
        final_growth = Scaler.scale_confidence(norm_growth, growth_result.confidence)
        
        # Authenticity: Max expected raw is 100
        raw_auth = float(authenticity_result.value)
        norm_auth = Normalizer.normalize_score(raw_auth, 0.0, 100.0)
        final_auth = Scaler.scale_confidence(norm_auth, authenticity_result.confidence)
        
        return CandidateFeatures(
            candidate_id=candidate_id,
            tenant_id=tenant_id,
            skill_depth=final_skill,
            career_progression=final_career,
            project_complexity=final_project,
            growth=final_growth,
            authenticity=final_auth
        )
