from pathlib import Path

from app.pipelines.ranking_pipeline import CompetitionSubmissionPipeline
from app.schemas.ranking import CandidateRank, RankingResult


def _build_ranking_result(total_candidates: int = 105) -> RankingResult:
    return RankingResult(
        job_id="job-123",
        rankings=[
            CandidateRank(
                candidate_id=f"cand-{index:03d}",
                job_id="job-123",
                final_score=max(0.0, 1.0 - (index * 0.001)),
                rank_position=index + 1,
                passed_gates=index % 2 == 0,
                failed_dimensions=[],
            )
            for index in range(total_candidates)
        ],
        total_ranked=total_candidates,
        metadata={"role_profile": "BACKEND_ENGINEER"},
    )


def test_competition_submission_pipeline_limits_to_top_100(tmp_path: Path):
    pipeline = CompetitionSubmissionPipeline(export_dir=tmp_path)
    ranking_result = _build_ranking_result()

    output_path = pipeline.write_csv(ranking_result=ranking_result)

    lines = output_path.read_text(encoding="utf-8").strip().splitlines()
    assert output_path.name == "job-123_top_100.csv"
    assert lines[0] == "job_id,rank,candidate_id,final_score,passed_gates"
    assert len(lines) == 101
    assert lines[1].startswith("job-123,1,cand-000,1.000000,true")
    assert lines[-1].startswith("job-123,100,cand-099,0.901000,false")


def test_competition_submission_pipeline_rejects_invalid_top_n(tmp_path: Path):
    pipeline = CompetitionSubmissionPipeline(export_dir=tmp_path)
    ranking_result = _build_ranking_result(total_candidates=3)

    try:
        pipeline.build_csv(ranking_result=ranking_result, top_n=0)
    except ValueError as exc:
        assert "top_n" in str(exc)
    else:
        raise AssertionError("Expected ValueError for invalid top_n")
