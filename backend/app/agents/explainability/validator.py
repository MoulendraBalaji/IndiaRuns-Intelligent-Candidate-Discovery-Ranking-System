from app.schemas.explainability import ExplanationDraft
from app.schemas.ranking import RankingResult

class DraftValidator:
    """
    Validates that draft comparison mappings are structurally correct.
    """
    @staticmethod
    def validate_draft(draft: ExplanationDraft, result: RankingResult) -> bool:
        valid_ids = {r.candidate_id for r in result.rankings}
        
        # Verify that all target candidates compared exist in the cohort
        for comp in draft.comparisons:
            if comp.compared_to_candidate_id not in valid_ids:
                return False
                
        return True
