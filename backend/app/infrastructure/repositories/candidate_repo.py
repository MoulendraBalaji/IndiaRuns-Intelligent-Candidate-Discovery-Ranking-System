import os
import json
import logging
from typing import List, Optional
from app.schemas.candidate import CandidateProfile
from app.schemas.feature_store import CandidateFeatures

logger = logging.getLogger(__name__)

class CandidateRepository:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        self.profiles_path = os.path.join(self.data_dir, "candidate_profiles.json")
        self.features_path = os.path.join(self.data_dir, "candidate_features.json")
        self._init_files()

    def _init_files(self):
        if not os.path.exists(self.profiles_path):
            with open(self.profiles_path, "w", encoding="utf-8") as f:
                json.dump({}, f)
        if not os.path.exists(self.features_path):
            with open(self.features_path, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def _load_dict(self, path: str) -> dict:
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading repository file {path}: {e}")
            return {}

    def _save_dict(self, path: str, data: dict):
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving repository file {path}: {e}")

    def save_profile(self, profile: CandidateProfile):
        data = self._load_dict(self.profiles_path)
        data[profile.id] = profile.model_dump(mode="json")
        self._save_dict(self.profiles_path, data)
        logger.info(f"Saved candidate profile {profile.id}")

    def get_profile(self, candidate_id: str) -> Optional[CandidateProfile]:
        data = self._load_dict(self.profiles_path)
        profile_data = data.get(candidate_id)
        if profile_data:
            return CandidateProfile(**profile_data)
        return None

    def list_profiles(self) -> List[CandidateProfile]:
        data = self._load_dict(self.profiles_path)
        return [CandidateProfile(**p) for p in data.values()]

    def save_features(self, features: CandidateFeatures):
        data = self._load_dict(self.features_path)
        data[features.candidate_id] = features.model_dump(mode="json")
        self._save_dict(self.features_path, data)
        logger.info(f"Saved candidate features for candidate {features.candidate_id}")

    def get_features(self, candidate_id: str) -> Optional[CandidateFeatures]:
        data = self._load_dict(self.features_path)
        features_data = data.get(candidate_id)
        if features_data:
            return CandidateFeatures(**features_data)
        return None
