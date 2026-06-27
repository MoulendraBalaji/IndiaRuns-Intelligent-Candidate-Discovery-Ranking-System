from typing import List
from app.schemas.job import Requirement, Capability, RoleTaxonomy

class EmbeddingTextBuilder:
    """
    Builds a normalized, highly semantic string representation of the job
    for vector search and matching.
    """
    
    @classmethod
    def build(
        cls, 
        title: str, 
        taxonomy: RoleTaxonomy, 
        requirements: List[Requirement],
        capabilities: List[Capability]
    ) -> str:
        lines = []
        
        # Taxonomy injection
        lines.append(f"Title: {title}")
        if taxonomy:
            lines.append(f"Role Family: {taxonomy.family}")
            lines.append(f"Level: {taxonomy.level}")
            lines.append(f"Domain: {taxonomy.domain}")
        
        # Mandatory technical skills get priority
        tech_skills = [req.text for req in requirements if req.category == "technical_skill" and req.priority == "mandatory"]
        if tech_skills:
            lines.append(f"Mandatory Technical Skills: {', '.join(tech_skills)}")
            
        # Capabilities
        caps = [c.name for c in capabilities]
        if caps:
            lines.append(f"Core Capabilities: {', '.join(caps)}")
            
        return "\n".join(lines)
