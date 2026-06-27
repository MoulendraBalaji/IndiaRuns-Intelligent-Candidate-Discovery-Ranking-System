class Normalizer:
    @staticmethod
    def normalize_score(raw_score: float, min_val: float, max_val: float) -> float:
        """
        Normalizes a raw score to a 0.0 - 1.0 range based on expected bounds.
        """
        if max_val == min_val:
            return 0.0
        normalized = (raw_score - min_val) / (max_val - min_val)
        return max(0.0, min(1.0, normalized))
