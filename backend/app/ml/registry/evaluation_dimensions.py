from dataclasses import dataclass, field
from typing import Dict, List

@dataclass
class DimensionMetadata:
    id: str
    display_name: str
    description: str
    color: str
    icon: str
    order: int
    default_weight: float
    minimum_threshold: float = 0.0

@dataclass
class RoleProfile:
    id: str
    display_name: str
    dimensions: Dict[str, float] = field(default_factory=dict)  # dimension_id -> weight
    thresholds: Dict[str, float] = field(default_factory=dict)  # dimension_id -> threshold override
    enabled_dimensions: List[str] = field(default_factory=list)

    def get_normalized_weights(self) -> Dict[str, float]:
        """
        Ensures all enabled dimension weights sum up to exactly 1.0.
        """
        enabled_weights = {
            dim: self.dimensions.get(dim, DIMENSION_METADATA[dim].default_weight)
            for dim in self.enabled_dimensions if dim in DIMENSION_METADATA
        }
        total = sum(enabled_weights.values())
        if total == 0:
            return {dim: 0.0 for dim in enabled_weights}
            
        return {dim: w / total for dim, w in enabled_weights.items()}

# 1. Centralized Dimension Metadata (reusable by UI, Explainability, Reranker)
DIMENSION_METADATA: Dict[str, DimensionMetadata] = {
    "technical_fit": DimensionMetadata(
        id="technical_fit",
        display_name="Technical Skills Alignment",
        description="Matches hard skills and tools from candidate features against job requirements.",
        color="#3B82F6",
        icon="cpu",
        order=1,
        default_weight=0.35,
        minimum_threshold=0.60  # Strict gate for technical qualification
    ),
    "domain_fit": DimensionMetadata(
        id="domain_fit",
        display_name="Domain Expertise",
        description="Experience in the specific industry, business sector, or product domain.",
        color="#10B981",
        icon="briefcase",
        order=2,
        default_weight=0.20
    ),
    "project_fit": DimensionMetadata(
        id="project_fit",
        display_name="Project Relevance & Scale",
        description="Complexity, scale, and business impact of previous engineering projects.",
        color="#8B5CF6",
        icon="git-branch",
        order=3,
        default_weight=0.15
    ),
    "experience_fit": DimensionMetadata(
        id="experience_fit",
        display_name="Experience Duration Fit",
        description="Alignment of career longevity against minimum/maximum requested years.",
        color="#F59E0B",
        icon="calendar",
        order=4,
        default_weight=0.20,
        minimum_threshold=0.40
    ),
    "behavior_fit": DimensionMetadata(
        id="behavior_fit",
        display_name="Behavior & Soft Skills",
        description="Leadership qualities, mentorship, communication, and career timeline consistency.",
        color="#EC4899",
        icon="users",
        order=5,
        default_weight=0.10
    )
}

# 2. Centralized Role Profiles
ROLE_PROFILES: Dict[str, RoleProfile] = {
    "BACKEND_ENGINEER": RoleProfile(
        id="backend",
        display_name="Backend Software Engineer",
        dimensions={
            "technical_fit": 0.40,
            "project_fit": 0.25,
            "domain_fit": 0.10,
            "experience_fit": 0.15,
            "behavior_fit": 0.10
        },
        thresholds={
            "technical_fit": 0.70  # Higher gate for engineering roles
        },
        enabled_dimensions=["technical_fit", "project_fit", "domain_fit", "experience_fit", "behavior_fit"]
    ),
    "DATA_SCIENTIST": RoleProfile(
        id="data_scientist",
        display_name="Data Scientist & AI Engineer",
        dimensions={
            "technical_fit": 0.30,
            "domain_fit": 0.30,
            "project_fit": 0.20,
            "experience_fit": 0.10,
            "behavior_fit": 0.10
        },
        enabled_dimensions=["technical_fit", "domain_fit", "project_fit", "experience_fit", "behavior_fit"]
    )
}
