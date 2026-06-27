from typing import List, Optional
from pydantic import BaseModel, Field

class RawRequirement(BaseModel):
    text: str = Field(..., description="The raw requirement text extracted from JD")
    confidence: float = Field(..., ge=0.0, le=1.0, description="LLM confidence in extraction")

class ExtractedJobEntities(BaseModel):
    """
    Direct output from the Gemini extraction layer.
    """
    title: str
    department: Optional[str] = None
    
    # Raw unclassified lists
    skills: List[str] = Field(default_factory=list, description="All technical and soft skills mentioned")
    responsibilities: List[str] = Field(default_factory=list, description="All core responsibilities and tasks")
    
    # Explicit raw constraints
    min_years_experience: float = Field(0.0)
    max_years_experience: Optional[float] = None
    education: Optional[str] = None
    
    implicit_constraints: List[str] = Field(default_factory=list, description="Implicit requirements like remote, startup experience, travel")
    
    clarity_score: float = Field(1.0, ge=0.0, le=1.0, description="How clear and unambiguous is this JD?")
    missing_sections: List[str] = Field(default_factory=list, description="Expected sections that are missing")
