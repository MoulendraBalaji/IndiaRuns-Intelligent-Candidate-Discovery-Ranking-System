from app.schemas.candidate import CandidateProfile, Role, Education
from app.schemas.extraction import ExtractedEntities
from .base import Builder

class CandidateProfileBuilder(Builder):
    @staticmethod
    def build(tenant_id: str, candidate_id: str, entities: ExtractedEntities, quality_score: float) -> CandidateProfile:
        experience = [
            Role(
                title=role.title,
                company=role.company,
                start_date=role.start_date,
                end_date=role.end_date,
                responsibilities=[role.description] if role.description else []
            ) for role in entities.roles
        ]
        
        education = [
            Education(
                degree=edu.degree,
                institution=edu.institution,
                graduation_year=edu.year,
                major="Unknown" # Default for now
            ) for edu in entities.education
        ]
        
        skills_str = ", ".join(entities.skills)
        experience_titles = ", ".join([r.title for r in entities.roles])
        embedding_text = f"Candidate: {entities.first_name} {entities.last_name}. Skills: {skills_str}. Experience: {experience_titles}."
        
        return CandidateProfile(
            tenant_id=tenant_id,
            id=candidate_id,
            first_name=entities.first_name,
            last_name=entities.last_name,
            email=entities.email,
            phone=entities.phone,
            summary="Extracted automatically from resume",
            experience=experience,
            education=education,
            hard_skills=entities.skills,
            total_years_experience=0.0,
            embedding_text=embedding_text
        )
