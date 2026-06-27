from typing import List
from app.schemas.job_extraction import ExtractedJobEntities
from app.schemas.job import Requirement

class RequirementClassifier:
    """
    Classifies raw strings into Requirement objects with priority and importance.
    """
    
    @classmethod
    def classify(cls, entities: ExtractedJobEntities) -> List[Requirement]:
        requirements = []
        
        # In a real system, this could use a fast zero-shot classifier or regex heuristics
        # Here we use heuristics based on keywords in the text
        
        for skill in entities.skills:
            # Simple heuristic
            priority = "mandatory" if "must" in skill.lower() or "required" in skill.lower() else "preferred"
            importance = 0.9 if priority == "mandatory" else 0.5
            
            requirements.append(
                Requirement(
                    text=skill,
                    category="technical_skill",
                    priority=priority,
                    importance=importance,
                    confidence=0.85
                )
            )
            
        for resp in entities.responsibilities:
            requirements.append(
                Requirement(
                    text=resp,
                    category="responsibility",
                    priority="mandatory",
                    importance=0.9,
                    confidence=0.9
                )
            )
            
        return requirements
