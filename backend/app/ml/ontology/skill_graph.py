from typing import List

class SkillGraph:
    """
    A graph-based ontology for normalizing and expanding skills.
    In a real enterprise system, this would be backed by Neo4j or a large embedding index.
    Here we implement a static graph for demonstration.
    """
    
    # Adjacency list: skill -> list of broader/related skills
    GRAPH = {
        "pytorch": ["deep_learning", "machine_learning", "python", "neural_networks"],
        "tensorflow": ["deep_learning", "machine_learning", "python", "neural_networks"],
        "docker": ["containerization", "devops"],
        "kubernetes": ["containerization", "orchestration", "devops", "cloud"],
        "fastapi": ["backend", "python", "api"],
        "react": ["frontend", "javascript", "typescript", "ui"]
    }
    
    @classmethod
    def expand_skill(cls, raw_skill: str) -> List[str]:
        """
        Takes a raw skill and returns its canonical normalized version along with its graph ancestors.
        """
        normalized = raw_skill.lower().strip().replace(" ", "_")
        
        # Include the normalized version itself
        expanded = {normalized}
        
        # Add graph parents if they exist
        if normalized in cls.GRAPH:
            expanded.update(cls.GRAPH[normalized])
            
        return list(expanded)
