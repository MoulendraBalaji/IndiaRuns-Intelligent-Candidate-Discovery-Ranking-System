from abc import ABC, abstractmethod
from typing import List
import logging
from sentence_transformers import SentenceTransformer

from app.ml.registry.models import EmbeddingModels

logger = logging.getLogger(__name__)

class EmbeddingProvider(ABC):
    """
    Abstract interface for generating vector embeddings.
    """
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        pass
        
    @property
    @abstractmethod
    def model_name(self) -> str:
        pass


class BGEProvider(EmbeddingProvider):
    """
    Local embedding provider using BAAI/bge-large-en-v1.5 via sentence-transformers.
    """
    def __init__(self, model_name: str = EmbeddingModels.BGE_LARGE):
        self._model_name = model_name
        logger.info(f"Loading local embedding model: {self._model_name}")
        # Note: In a real production deployment, this model would be loaded 
        # once at startup or hosted on a dedicated inference server.
        self.model = SentenceTransformer(self._model_name)
        
    @property
    def model_name(self) -> str:
        return self._model_name
        
    @property
    def dimension(self) -> int:
        # BGE-large-en-v1.5 has 1024 dimensions.
        return self.model.get_sentence_embedding_dimension()

    def embed_text(self, text: str) -> List[float]:
        # For BGE, queries might need an instruction prefix, 
        # but for candidate semantic indexing we can just embed the text.
        embeddings = self.model.encode([text], normalize_embeddings=True)
        return embeddings[0].tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        return embeddings.tolist()
