import time
from typing import Any, Dict

from app.schemas.agent import AgentRequest, AgentResponse

class GrowthPotentialAgent:
    """
    Agent 08: Growth Potential Agent
    Predicts future trajectory from past signals — 'who will become great, not just who is great now'.
    """

    def _calculate_cert_velocity(self, certifications: list) -> float:
        if not certifications:
            return 0.0
        # Simplistic: More certifications = higher velocity (max 5 for 1.0)
        return min(1.0, len(certifications) / 5.0)
        
    def _calculate_title_acceleration(self, career_history: list) -> float:
        if not career_history or len(career_history) < 2:
            return 0.5
        # Simplistic heuristic: if there are many roles with short durations (fast promotion), high acceleration.
        # But we don't have titles semantic ranking. Just use number of roles / total duration.
        total_months = sum(r.get("duration_months", 12) for r in career_history)
        if total_months == 0: return 0.5
        velocity = len(career_history) / (total_months / 12.0)
        return min(1.0, velocity / 0.5)  # 1 promotion every 2 years = 1.0

    def evaluate(self, request: AgentRequest) -> AgentResponse:
        start_time = time.time()
        
        try:
            candidate_profile = request.payload.get("candidate_profile", {})
            career_history = candidate_profile.get("career_history", [])
            certifications = candidate_profile.get("certifications", [])
            signals = candidate_profile.get("redrob_signals", {})
            
            # Sub-scores
            complexity_trend = 0.6  # Default as we don't have deep semantic project parsing yet
            cert_velocity = self._calculate_cert_velocity(certifications)
            title_acceleration = self._calculate_title_acceleration(career_history)
            
            # Community growth proxy (e.g. connections, github)
            github_score = signals.get("github_activity_score", 0)
            community_growth = (max(0, github_score) / 100.0)
            
            # GP = 0.4×(complexity_trend) + 0.3×(cert_velocity) + 0.2×(title_acceleration) + 0.1×(community_growth)
            gp = 0.4 * complexity_trend + 0.3 * cert_velocity + 0.2 * title_acceleration + 0.1 * community_growth
            
            final_score = min(100.0, max(0.0, gp * 100.0))
            
            data = {
                "growth_potential": round(final_score, 2),
                "trajectory_direction": "UP" if final_score > 60 else "FLAT",
            }
            
            return AgentResponse(
                success=True,
                data=data,
                confidence=0.8,
                processing_time_ms=int((time.time() - start_time) * 1000)
            )
        except Exception as e:
            return AgentResponse(
                success=False,
                error=str(e),
                confidence=0.0,
                processing_time_ms=int((time.time() - start_time) * 1000)
            )
