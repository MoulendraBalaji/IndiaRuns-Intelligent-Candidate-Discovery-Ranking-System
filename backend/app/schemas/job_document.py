from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
import hashlib

class JobDocument(BaseModel):
    """
    Standardized input format for any job description.
    """
    tenant_id: str
    job_id: Optional[str] = None
    raw_text: str = Field(..., description="The raw, unparsed text of the job description")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Any external ATS metadata")
    
    @property
    def hash(self) -> str:
        """Generates a stable hash of the JD text for caching."""
        return hashlib.sha256(self.raw_text.encode()).hexdigest()
