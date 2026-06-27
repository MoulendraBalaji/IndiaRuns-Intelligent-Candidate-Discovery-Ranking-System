from __future__ import annotations

import csv
from io import StringIO
from pathlib import Path
from typing import Optional

from app.schemas.ranking import RankingResult


class CompetitionSubmissionPipeline:
    """
    Builds a deterministic Top-N CSV export from a cached ranking result.
    """

    DEFAULT_TOP_N = 100
    CSV_HEADERS = ("job_id", "rank", "candidate_id", "final_score", "passed_gates")

    def __init__(self, export_dir: str | Path = "data/submissions") -> None:
        self.export_dir = Path(export_dir)
        self.export_dir.mkdir(parents=True, exist_ok=True)

    def build_csv(self, ranking_result: RankingResult, top_n: int = DEFAULT_TOP_N) -> str:
        if top_n <= 0:
            raise ValueError("top_n must be greater than 0")

        buffer = StringIO()
        writer = csv.DictWriter(buffer, fieldnames=self.CSV_HEADERS)
        writer.writeheader()

        for rank in ranking_result.rankings[:top_n]:
            writer.writerow(
                {
                    "job_id": ranking_result.job_id,
                    "rank": rank.rank_position,
                    "candidate_id": rank.candidate_id,
                    "final_score": f"{rank.final_score:.6f}",
                    "passed_gates": str(rank.passed_gates).lower(),
                }
            )

        return buffer.getvalue()

    def write_csv(
        self,
        ranking_result: RankingResult,
        top_n: int = DEFAULT_TOP_N,
        destination: Optional[str | Path] = None,
    ) -> Path:
        csv_content = self.build_csv(ranking_result=ranking_result, top_n=top_n)
        output_path = Path(destination) if destination else self.export_dir / f"{ranking_result.job_id}_top_{top_n}.csv"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(csv_content, encoding="utf-8", newline="")
        return output_path
