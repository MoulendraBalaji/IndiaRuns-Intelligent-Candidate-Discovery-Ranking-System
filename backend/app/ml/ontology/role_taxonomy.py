from typing import Optional
from app.schemas.job import RoleTaxonomy

class RoleTaxonomyMapper:
    """
    Maps raw job titles to a standard taxonomy.
    """
    
    @classmethod
    def map_title(cls, title: str) -> RoleTaxonomy:
        title_lower = title.lower()
        
        # Family & Domain
        if "machine learning" in title_lower or "ml" in title_lower or "ai" in title_lower:
            family = "AI Engineering"
            domain = "Machine Learning"
        elif "data" in title_lower:
            family = "Data Engineering"
            domain = "Data"
        elif "backend" in title_lower:
            family = "Software Engineering"
            domain = "Backend"
        else:
            family = "Engineering"
            domain = "General"
            
        # Level
        if "senior" in title_lower or "sr" in title_lower:
            level = "Senior"
        elif "lead" in title_lower or "principal" in title_lower or "staff" in title_lower:
            level = "Staff/Lead"
        elif "intern" in title_lower:
            level = "Intern"
        else:
            level = "Mid"
            
        # Function
        function = "Engineering"
        
        return RoleTaxonomy(
            family=family,
            level=level,
            domain=domain,
            function=function
        )
