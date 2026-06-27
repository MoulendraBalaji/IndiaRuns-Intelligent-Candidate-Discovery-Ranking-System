from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ResumeSection(BaseModel):
    title: str = Field(..., description="E.g., 'Work Experience', 'Education'")
    content: str = Field(..., description="Raw text of this section")

class ResumeDocument(BaseModel):
    """
    Standardized document input for the Candidate Intelligence Agent.
    Abstracts away the origin (PDF, Docling, ATS JSON, etc.)
    """
    tenant_id: str = Field(..., description="Tenant ID for RLS")
    candidate_id: Optional[str] = Field(None, description="Optional Candidate ID if known")
    
    raw_text: str = Field(..., description="Full raw text of the resume")
    sections: List[ResumeSection] = Field(default_factory=list, description="Parsed logical sections")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Parsing metadata (e.g., origin, parser_version)")
