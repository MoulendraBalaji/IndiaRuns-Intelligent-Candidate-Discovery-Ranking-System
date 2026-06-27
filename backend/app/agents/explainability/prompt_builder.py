import json
from app.schemas.explainability import ExplanationContext

class ExplanationPromptBuilder:
    """
    Formulates a structured context representation for the prompt,
    excluding raw text noise.
    """
    @staticmethod
    def build_prompt_context(context: ExplanationContext) -> str:
        data = {
            "evaluation_report": {
                "candidate_id": context.evaluation_report.candidate_id,
                "job_id": context.evaluation_report.job_id,
                "dimensions": {
                    k: {
                        "score": d.score,
                        "weight": d.weight,
                        "reasoning": d.reasoning,
                        "evidence": [e.model_dump() for e in d.evidence]
                    }
                    for k, d in context.evaluation_report.dimensions.items()
                },
                "conflicts": [c.model_dump() for c in context.evaluation_report.conflicts],
                "risks": context.evaluation_report.risks.model_dump(),
                "recommendation": context.evaluation_report.recommendation.value
            },
            "ranking_result": {
                "total_ranked": context.ranking_result.total_ranked,
                # Include ranking of target candidate
                "candidate_rank": next(
                    (r.model_dump() for r in context.ranking_result.rankings if r.candidate_id == context.evaluation_report.candidate_id),
                    None
                )
            },
            "comparison_target": context.comparison_target.model_dump() if context.comparison_target else None,
            "role_profile": context.role_profile,
            "explanation_type": context.explanation_type.value
        }
        return json.dumps(data, indent=2)
