import hashlib
from typing import Optional, List

class EmbeddingCache:
    """
    A simple hash-based in-memory cache for embeddings.
    In a real system, this would be backed by Redis.
    """
    def __init__(self):
        # Maps text hash to (embedding_vector, version)
        self._cache = {}

    def _hash(self, text: str) -> str:
        return hashlib.sha256(text.encode('utf-8')).hexdigest()

    def get(self, text: str) -> Optional[List[float]]:
        key = self._hash(text)
        return self._cache.get(key)

    def set(self, text: str, embedding: List[float]):
        key = self._hash(text)
        self._cache[key] = embedding
