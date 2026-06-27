from app.ml.benchmark.benchmark_suite import PlatformBenchmarkSuite

def test_benchmark_suite_latency_and_caching():
    suite = PlatformBenchmarkSuite()
    
    # Simulate hits/misses
    suite.record_cache_hit()
    suite.record_cache_hit()
    suite.record_cache_miss()
    
    # Simulate durations
    suite.record_metric("embedding_generation_ms", 120.0)
    suite.record_metric("embedding_generation_ms", 100.0)
    suite.record_metric("retrieval_latency_ms", 15.0)
    
    summary = suite.generate_summary()
    
    # Verify cache rates
    assert summary["cache"]["total_requests"] == 3
    assert summary["cache"]["hits"] == 2
    assert summary["cache"]["hit_rate_percent"] == 66.67
    
    # Verify latency distributions
    lat = summary["latencies"]["embedding_generation_ms"]
    assert lat["count"] == 2
    assert lat["mean_ms"] == 110.0
    assert lat["min_ms"] == 100.0
    assert lat["max_ms"] == 120.0
