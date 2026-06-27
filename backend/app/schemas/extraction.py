from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractedRole(BaseModel):
    title: str
    company: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: str = ""

class ExtractedProject(BaseModel):
    name: str
    description: str
    technologies: List[str] = Field(default_factory=list)
    impact: str = ""

class ExtractedEducation(BaseModel):
    degree: str
    institution: str
    year: Optional[int] = None

class ExtractedEntities(BaseModel):
    """
    Schema for the raw structured output produced by the LLM Extraction step.
    This acts as the input for the downstream Feature Pipelines.
    """
    first_name: str = ""
    last_name: str = ""
    email: Optional[str] = None
    phone: Optional[str] = None
    
    skills: List[str] = Field(default_factory=list)
    roles: List[ExtractedRole] = Field(default_factory=list)
    projects: List[ExtractedProject] = Field(default_factory=list)
    education: List[ExtractedEducation] = Field(default_factory=list)
