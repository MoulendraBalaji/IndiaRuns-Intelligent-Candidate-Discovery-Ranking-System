from typing import List, Dict, Any
from app.schemas.job_extraction import ExtractedJobEntities
from app.schemas.job import JobProfile, Requirement, Capability, RoleTaxonomy, JobQuality
from .embedding_builder import EmbeddingTextBuilder

class JobProfileBuilder:
    @staticmethod
    def build(
        tenant_id: str,
        job_id: str,
        entities: ExtractedJobEntities,
        requirements: List[Requirement],
        capabilities: List[Capability],
        taxonomy: RoleTaxonomy,
        complexity_score: float,
        metadata: Dict[str, Any]
    ) -> JobProfile:
        
        embedding_text = EmbeddingTextBuilder.build(
            title=entities.title,
            taxonomy=taxonomy,
            requirements=requirements,
            capabilities=capabilities
        )
        
        quality = JobQuality(
            clarity=entities.clarity_score,
            missing_sections=entities.missing_sections,
            ambiguity=1.0 - entities.clarity_score
        )
        
        return JobProfile(
            tenant_id=tenant_id,
            id=job_id,
            title=entities.title,
            department=entities.department,
            taxonomy=taxonomy,
            requirements=requirements,
            capabilities=capabilities,
            constraints=entities.implicit_constraints,
            min_years_experience=entities.min_years_experience,
            max_years_experience=entities.max_years_experience,
            education_requirement=entities.education,
            complexity_score=complexity_score,
            quality=quality,
            embedding_text=embedding_text,
            metadata=metadata
        )
