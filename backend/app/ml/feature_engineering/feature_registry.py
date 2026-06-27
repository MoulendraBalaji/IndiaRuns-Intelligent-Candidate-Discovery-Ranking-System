from typing import Dict, Any

class FeatureRegistry:
    """
    Registry for configurable features used by the Evaluation Agent and Feature Store.
    Decouples feature definitions from hardcoded business logic.
    """
    FEATURES: Dict[str, Dict[str, Any]] = {
        "skill_depth": {
            "weight": 0.25,
            "type": "continuous",
            "description": "Normalized depth of technical skills."
        },
        "career_progression": {
            "weight": 0.15,
            "type": "continuous",
            "description": "Trajectory of promotions and responsibility."
        },
        "project_complexity": {
            "weight": 0.20,
            "type": "continuous",
            "description": "Complexity and impact of projects delivered."
        },
        "growth": {
            "weight": 0.15,
            "type": "continuous",
            "description": "Demonstrated ability to learn and adapt."
        },
        "authenticity": {
            "weight": 0.10,
            "type": "continuous",
            "description": "Confidence in resume authenticity."
        },
        "timeline_consistency": {
            "weight": 0.15,
            "type": "continuous",
            "description": "Chronological integrity of work history."
        }
    }

    @classmethod
    def get_feature(cls, name: str) -> Dict[str, Any]:
        return cls.FEATURES.get(name, {})
