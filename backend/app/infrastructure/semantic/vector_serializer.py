from typing import Dict, Any
from app.schemas.candidate import CandidateProfile
from app.schemas.retrieval import CandidatePayload

class VectorSerializer:
    """
    Handles mapping from domain objects to vector store payloads.
    """
    @staticmethod
    def to_candidate_payload(profile: CandidateProfile, embedding_version: str) -> CandidatePayload:
        return CandidatePayload(
            candidate_id=profile.id,
            role=profile.current_role,
            location=profile.location,
            experience_years=profile.experience_years,
            embedding_version=embedding_version,
            metadata={
                "has_degree": bool(profile.education),
                "is_active": True,
                "skills": [s.name for s in profile.skills]
            }
        )
