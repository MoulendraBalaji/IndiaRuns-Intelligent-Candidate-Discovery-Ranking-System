import time
from app.schemas.explainability import (
    ExplanationContext, ExplanationDraft, ExplainabilityReport, 
    ExplainabilityMetadata, CohortComparison
)

class ExplainabilityReportBuilder:
    """
    Constructs the final, system-validated ExplainabilityReport.
    """
    @staticmethod
    def build(
        context: ExplanationContext,
        draft: ExplanationDraft,
        duration_ms: int,
        model_version: str = "gemini-2.5-flash",
        prompt_version: str = "v1",
        explanation_confidence: float = 0.95
    ) -> ExplainabilityReport:
        
        # Build metadata
        metadata = ExplainabilityMetadata(
            model_version=model_version,
            prompt_version=prompt_version,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            explanation_confidence=explanation_confidence,
            generation_duration_ms=duration_ms,
            schema_version="1.0.0"
        )
        
        # Map comparisons
        comparisons = [
            CohortComparison(
                compared_to_candidate_id=c.compared_to_candidate_id,
                better_aspects=c.better_aspects,
                worse_aspects=c.worse_aspects,
                justification=c.justification
            )
            for c in draft.comparisons
        ]
        
        return ExplainabilityReport(
            candidate_id=context.evaluation_report.candidate_id,
            job_id=context.evaluation_report.job_id,
            explanation_type=context.explanation_type,
            summary=draft.summary,
            dimension_explanations=draft.dimension_explanations,
            strengths=draft.strengths,
            weaknesses=draft.weaknesses,
            interview_focus=draft.interview_focus,
            development_opportunities=draft.development_opportunities,
            comparisons=comparisons,
            metadata=metadata
        )
