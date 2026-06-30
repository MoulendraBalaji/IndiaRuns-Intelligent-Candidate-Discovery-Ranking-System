from app.schemas.candidate import CandidateProfile
from app.schemas.retrieval import CandidatePayload

class VectorSerializer:
    """
    Handles mapping from domain objects to vector store payloads.
    """
    @staticmethod
    def to_candidate_payload(profile: CandidateProfile, embedding_version: str) -> CandidatePayload:
        role = profile.experience[0].title if profile.experience else "Unknown"
        return CandidatePayload(
            candidate_id=profile.id,
            role=role,
            location="Unknown",
            experience_years=profile.total_years_experience,
            embedding_version=embedding_version,
            metadata={
                "has_degree": bool(profile.education),
                "is_active": True,
                "skills": profile.hard_skills
            }
        )
