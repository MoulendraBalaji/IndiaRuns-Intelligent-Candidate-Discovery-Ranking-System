import time
from datetime import datetime
from typing import Any, Dict, Optional

from app.schemas.agent import AgentRequest, AgentResponse

class BehavioralIntelligenceAgent:
    """
    Agent 06: Behavioral Intelligence Agent
    Estimates hiring intent and cultural engagement from observable behavioral signals.
    """

    def _calculate_recency(self, last_active_date: str) -> float:
        try:
            last_active = datetime.strptime(last_active_date, "%Y-%m-%d")
            # For hackathon purposes, assume "now" is the most recent date in the dataset or a fixed date
            # But we can just use a simple delta from a fixed date like 2026-06-01
            now = datetime(2026, 6, 1)
            delta = (now - last_active).days
            if delta <= 7:
                return 1.0
            elif delta <= 30:
                return 0.8
            elif delta <= 90:
                return 0.5
            else:
                return 0.1
        except Exception:
            return 0.5

    def evaluate(self, request: AgentRequest) -> AgentResponse:
        start_time = time.time()
        
        try:
            candidate_profile = request.payload.get("candidate_profile", {})
            signals = candidate_profile.get("redrob_signals", {})
            
            # Extract fields safely
            profile_completeness = signals.get("profile_completeness_score", 50.0) / 100.0
            last_active_date = signals.get("last_active_date", "2025-01-01")
            recruiter_response_rate = signals.get("recruiter_response_rate", 0.5)
            github_activity = signals.get("github_activity_score", 0)
            
            # Recency
            recency_score = self._calculate_recency(last_active_date)
            
            # Base Engagement formula: 0.5 * recency + 0.5 * completeness
            engagement_score = 0.5 * recency_score + 0.5 * profile_completeness
            
            # Adjust with recruiter response rate
            engagement_score = engagement_score * 0.7 + recruiter_response_rate * 0.3
            
            # Scale to 0-100
            final_score = min(100.0, max(0.0, engagement_score * 100.0))
            
            data = {
                "engagement_score": round(final_score, 2),
                "hiring_readiness_signal": "high" if final_score > 75 else "medium" if final_score > 40 else "low"
            }
            
            return AgentResponse(
                success=True,
                data=data,
                confidence=0.9,
                processing_time_ms=int((time.time() - start_time) * 1000)
            )
        except Exception as e:
            return AgentResponse(
                success=False,
                error=str(e),
                confidence=0.0,
                processing_time_ms=int((time.time() - start_time) * 1000)
            )
