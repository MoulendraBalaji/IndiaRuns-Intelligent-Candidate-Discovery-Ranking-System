import logging
from typing import Tuple, List
from app.schemas.evaluation import EvaluationReport
from app.ml.registry.evaluation_dimensions import DIMENSION_METADATA, RoleProfile

logger = logging.getLogger(__name__)

class DeterministicScorer:
    """
    Computes final scores and gates for a single candidate evaluation report
    based on the configured RoleProfile and dimension metadata.
    """
    @staticmethod
    def score_candidate(report: EvaluationReport, profile: RoleProfile) -> Tuple[float, bool, List[str]]:
        """
        Returns:
            Tuple[float, bool, List[str]]:
                - final_score (0.0 to 1.0)
                - passed_gates (True/False)
                - failed_dimensions (list of dimension IDs that missed thresholds)
        """
        normalized_weights = profile.get_normalized_weights()
        
        final_score = 0.0
        passed_gates = True
        failed_dimensions = []

        # Iterate over all registry-defined dimensions
        for dim_id, metadata in DIMENSION_METADATA.items():
            # Skip if this dimension is not enabled for the role profile
            if dim_id not in profile.enabled_dimensions:
                continue
                
            # Get the candidate's score for this dimension (defaults to 0.0 if missing)
            dim_score_obj = report.dimensions.get(dim_id)
            score_value = dim_score_obj.score if dim_score_obj else 0.0
            
            # Determine weight
            weight = normalized_weights.get(dim_id, 0.0)
            final_score += score_value * weight
            
            # Check gates (threshold overrides from profile first, then metadata defaults)
            threshold = profile.thresholds.get(dim_id, metadata.minimum_threshold)
            if score_value < threshold:
                passed_gates = False
                failed_dimensions.append(dim_id)
                logger.info(
                    f"Candidate {report.candidate_id} failed gate for {dim_id}: "
                    f"score {score_value:.2f} < threshold {threshold:.2f}"
                )

        return min(max(final_score, 0.0), 1.0), passed_gates, failed_dimensions
