import time
import statistics
from typing import List, Dict, Any

class PlatformBenchmarkSuite:
    """
    Validation and benchmarking suite for profiling platform latency, 
    caching efficiencies, and ranking consistency.
    """
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {
            "embedding_generation_ms": [],
            "retrieval_latency_ms": [],
            "evaluation_latency_ms": [],
            "explainability_latency_ms": []
        }
        self.cache_hits = 0
        self.cache_misses = 0

    def record_cache_hit(self):
        self.cache_hits += 1

    def record_cache_miss(self):
        self.cache_misses += 1

    def record_metric(self, name: str, duration_ms: float):
        if name in self.metrics:
            self.metrics[name].append(duration_ms)

    def generate_summary(self) -> Dict[str, Any]:
        total_cache_requests = self.cache_hits + self.cache_misses
        cache_hit_rate = (self.cache_hits / total_cache_requests * 100.0) if total_cache_requests > 0 else 0.0
        
        summary = {
            "cache": {
                "total_requests": total_cache_requests,
                "hits": self.cache_hits,
                "misses": self.cache_misses,
                "hit_rate_percent": round(cache_hit_rate, 2)
            },
            "latencies": {}
        }
        
        for name, values in self.metrics.items():
            if values:
                summary["latencies"][name] = {
                    "count": len(values),
                    "mean_ms": round(statistics.mean(values), 2),
                    "median_ms": round(statistics.median(values), 2),
                    "max_ms": round(max(values), 2),
                    "min_ms": round(min(values), 2)
                }
            else:
                summary["latencies"][name] = {
                    "count": 0,
                    "mean_ms": 0.0,
                    "median_ms": 0.0
                }
                
        return summary
