class Scaler:
    @staticmethod
    def scale_confidence(raw_score: float, confidence: float) -> float:
        """
        Dampens the score based on confidence.
        If confidence is 1.0, score remains unchanged.
        If confidence is 0.5, score is pulled towards 0.5 (neutral).
        """
        neutral = 0.5
        return raw_score * confidence + neutral * (1 - confidence)
