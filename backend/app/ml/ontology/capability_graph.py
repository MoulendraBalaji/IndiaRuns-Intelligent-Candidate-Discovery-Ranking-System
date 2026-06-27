from typing import List

class CapabilityGraph:
    """
    Maps extracted success signals and tasks to broader Capabilities.
    """
    
    # Mapping substring keywords to capabilities
    CAPABILITY_MAPPING = {
        "deploy": "Deployment & MLOps",
        "api": "Backend API Development",
        "kubernetes": "Cloud-native Deployment",
        "docker": "Containerization",
        "scalable": "Distributed Systems",
        "lead": "Technical Leadership",
        "mentor": "Mentorship",
        "architecture": "System Architecture"
    }
    
    @classmethod
    def derive_capabilities(cls, raw_texts: List[str]) -> List[str]:
        capabilities = set()
        for text in raw_texts:
            text_lower = text.lower()
            for key, cap in cls.CAPABILITY_MAPPING.items():
                if key in text_lower:
                    capabilities.add(cap)
        return list(capabilities)
