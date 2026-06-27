from app.schemas.job_extraction import ExtractedJobEntities

class JobComplexityScorer:
    """
    Calculates the complexity of a role based on required experience, 
    number of responsibilities, and constraints.
    """
    
    @classmethod
    def score(cls, entities: ExtractedJobEntities) -> float:
        score = 0.0
        
        # 1. Experience factor (0-10 years)
        exp = min(entities.min_years_experience, 10.0)
        score += (exp / 10.0) * 0.4  # Up to 40% based on experience
        
        # 2. Responsibilities factor
        resp_count = len(entities.responsibilities)
        score += min(resp_count / 10.0, 1.0) * 0.3  # Up to 30% based on number of tasks
        
        # 3. Constraint complexity
        constraints = len(entities.implicit_constraints)
        score += min(constraints / 5.0, 1.0) * 0.3  # Up to 30% based on constraints
        
        # Cap at 1.0
        return min(max(score, 0.0), 1.0)
