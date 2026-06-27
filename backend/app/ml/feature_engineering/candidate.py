from app.schemas.pipeline import PipelineResult
from app.schemas.feature_store import CandidateFeatures, FeatureValue
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
        authenticity_result: PipelineResult,
        timeline_result: PipelineResult
    ) -> CandidateFeatures:
        """
        Transforms raw pipeline results into scaled, normalized features for the Feature Store.
        """
        
        def process(res: PipelineResult, max_val: float, min_val: float = 0.0, lineage: list = None) -> FeatureValue:
            # If value is a dict (like in timeline), we might need custom logic.
            # For this simple example, we assume we just pass a numeric value.
            raw = float(res.value) if not isinstance(res.value, dict) else float(res.value.get("consistency", 0.0))
            norm = Normalizer.normalize_score(raw, min_val, max_val)
            final = Scaler.scale_confidence(norm, res.confidence)
            return FeatureValue(value=final, derived_from=lineage or [])

        # Construct versions dict
        versions = {
            "skill_depth": skill_result.version,
            "career_progression": career_result.version,
            "project_complexity": project_result.version,
            "growth": growth_result.version,
            "authenticity": authenticity_result.version,
            "timeline_consistency": timeline_result.version
        }
        
        return CandidateFeatures(
            candidate_id=candidate_id,
            tenant_id=tenant_id,
            skill_depth=process(skill_result, 100.0, lineage=["extracted_skills"]),
            career_progression=process(career_result, 50.0, lineage=["extracted_roles"]),
            project_complexity=process(project_result, 40.0, lineage=["extracted_projects"]),
            growth=process(growth_result, 100.0, lineage=["extracted_skills", "extracted_roles"]),
            authenticity=process(authenticity_result, 100.0, lineage=["extracted_roles", "extracted_education"]),
            timeline_consistency=process(timeline_result, 1.0, lineage=["extracted_roles"]),
            versions=versions
        )
