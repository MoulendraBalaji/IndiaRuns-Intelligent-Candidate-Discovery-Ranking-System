import uuid
import logging
from typing import List, Optional
import io

from app.schemas.candidate import CandidateProfile
from app.schemas.feature_store import CandidateFeatures
from app.schemas.agent import AgentRequest
from app.agents.candidate_intelligence.agent import CandidateIntelligenceAgent
from app.infrastructure.repositories.candidate_repo import CandidateRepository
from app.infrastructure.semantic.index_service import SemanticIndexService
from app.infrastructure.semantic.embedding_provider import BGEProvider
from app.infrastructure.vector_store.qdrant_client import QdrantVectorStore, CollectionConfig

logger = logging.getLogger(__name__)

class CandidateService:
    def __init__(self, candidate_repo: CandidateRepository):
        self.candidate_repo = candidate_repo
        self.agent = CandidateIntelligenceAgent()
        
        # Initialize semantic indexing
        self.embedding_provider = BGEProvider()
        self.index_service = SemanticIndexService(self.embedding_provider)
        
        # Initialize vector store
        import os
        qdrant_url = os.environ.get("QDRANT_URL", "http://localhost:6333")
        self.qdrant = QdrantVectorStore(url=qdrant_url)
        self.collection_name = "candidates"
        
        # Ensure collection is created
        try:
            config = CollectionConfig(
                name=self.collection_name,
                embedding_model=self.embedding_provider.model_name,
                dimension=self.embedding_provider.dimension
            )
            self.qdrant.ensure_collection(config)
        except Exception as e:
            logger.warning(f"Failed to initialize Qdrant collection: {e}")

    def _extract_text(self, file_bytes: bytes, filename: str) -> str:
        """Extract text from PDF, DOCX or TXT file."""
        if filename.endswith(".pdf"):
            try:
                import pdfplumber
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    text = "\n".join([page.extract_text() or "" for page in pdf.pages])
                    if text.strip():
                        return text
            except Exception as e:
                logger.warning(f"pdfplumber failed, trying pypdf: {e}")
            
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                text = "\n".join([page.extract_text() or "" for page in reader.pages])
                if text.strip():
                    return text
            except Exception as e:
                logger.warning(f"pypdf failed: {e}")

        # Fallback to plain decoding
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return file_bytes.decode("latin-1", errors="ignore")

    async def upload_resume(self, tenant_id: str, filename: str, file_bytes: bytes) -> CandidateProfile:
        candidate_id = str(uuid.uuid4())
        raw_text = self._extract_text(file_bytes, filename)
        
        # Prepare request for agent
        req = AgentRequest(
            tenant_id=tenant_id,
            payload={
                "tenant_id": tenant_id,
                "candidate_id": candidate_id,
                "raw_text": raw_text,
                "sections": [],
                "metadata": {
                    "filename": filename
                }
            }
        )
        
        # Execute CandidateIntelligenceAgent
        response = await self.agent.execute(req)
        if not response.success:
            raise ValueError(f"Resume analysis failed: {response.error}")
            
        data = response.data
        
        # 1. Build and save CandidateProfile
        profile_data = data["profile"]
        profile_data["id"] = candidate_id
        profile_data["tenant_id"] = tenant_id
        profile = CandidateProfile(**profile_data)
        self.candidate_repo.save_profile(profile)
        
        # 2. Build and save CandidateFeatures
        features_data = data["features"]
        features_data["candidate_id"] = candidate_id
        features_data["tenant_id"] = tenant_id
        features = CandidateFeatures(**features_data)
        self.candidate_repo.save_features(features)
        
        # 3. Index semantically in Qdrant
        try:
            records = self.index_service.index_candidates([profile])
            self.qdrant.upsert_candidates(self.collection_name, records)
        except Exception as e:
            logger.error(f"Failed to upsert candidate embedding to Qdrant: {e}")
            
        return profile

    def get_candidate(self, candidate_id: str) -> Optional[CandidateProfile]:
        return self.candidate_repo.get_profile(candidate_id)

    def list_candidates(self) -> List[CandidateProfile]:
        return self.candidate_repo.list_profiles()
