from qdrant_client import models
from app.schemas.job import JobProfile

class MetadataFilterBuilder:
    """
    Constructs Qdrant filters based on JobProfile constraints.
    """
    @classmethod
    def build_hybrid_filter(cls, job: JobProfile) -> models.Filter:
        must_conditions = []
        
        # Example: if the job requires a minimum of 3 years of experience
        if job.min_years_experience > 0:
            must_conditions.append(
                models.FieldCondition(
                    key="experience_years",
                    range=models.Range(
                        gte=job.min_years_experience
                    )
                )
            )
            
        # Example: location or remote constraints
        # Real logic would parse 'Remote' from constraints, here we check text simply
        is_remote = any("remote" in c.lower() for c in job.constraints)
        if is_remote:
            must_conditions.append(
                models.FieldCondition(
                    key="location",
                    match=models.MatchValue(value="Remote")
                )
            )
            
        if must_conditions:
            return models.Filter(must=must_conditions)
            
        return models.Filter() # Empty filter = pure semantic search
