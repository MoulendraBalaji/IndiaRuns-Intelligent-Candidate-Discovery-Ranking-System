import logging

logger = logging.getLogger(__name__)

class RetrievalMetrics:
    """
    Collects telemetry data for retrieval passes.
    In a real system, this could log to Datadog or Prometheus.
    """
    @classmethod
    def record(cls, job_id: str, latency_ms: int, top_k: int, results_count: int, average_similarity: float):
        logger.info(
            f"Retrieval Metrics | Job: {job_id} | "
            f"Latency: {latency_ms}ms | Requested K: {top_k} | "
            f"Returned: {results_count} | Avg Sim: {average_similarity:.4f}"
        )
