import csv
from io import StringIO
from pathlib import Path
from typing import Dict, Optional

from app.schemas.ranking import RankingResult
from app.schemas.explainability import ExplainabilityReport

class SubmissionWriter:
    """
    Responsible for writing the final competition submission CSV.
    Adheres strictly to the required submission schema:
    candidate_id, rank, score, reasoning
    """
    
    CSV_HEADERS = ["candidate_id", "rank", "score", "reasoning"]

    def __init__(self, export_dir: str | Path = "data/submissions") -> None:
        self.export_dir = Path(export_dir)
        self.export_dir.mkdir(parents=True, exist_ok=True)

    def generate_csv(self, ranking_result: RankingResult, explanations: Dict[str, ExplainabilityReport], top_n: int = 100) -> str:
        """
        Generates the CSV string content for the submission.
        """
        buffer = StringIO()
        writer = csv.DictWriter(buffer, fieldnames=self.CSV_HEADERS)
        writer.writeheader()

        # Assuming rankings are already sorted by final_score descending
        # Ensure we only process top_n
        for rank in ranking_result.rankings[:top_n]:
            # Fallback reasoning if none provided
            reasoning = "Strong candidate matching role requirements."
            if rank.candidate_id in explanations:
                report = explanations[rank.candidate_id]
                # Use the summary from the explainability report
                reasoning = report.summary.strip()
                
            writer.writerow({
                "candidate_id": rank.candidate_id,
                "rank": rank.rank_position,
                "score": f"{rank.final_score:.6f}",
                "reasoning": reasoning
            })

        return buffer.getvalue()

    def write_csv(
        self,
        ranking_result: RankingResult,
        explanations: Dict[str, ExplainabilityReport],
        top_n: int = 100,
        destination: Optional[str | Path] = None,
        team_id: str = "team_submission"
    ) -> Path:
        """
        Writes the submission CSV file to disk.
        """
        csv_content = self.generate_csv(ranking_result, explanations, top_n)
        
        output_path = Path(destination) if destination else self.export_dir / f"{team_id}.csv"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        output_path.write_text(csv_content, encoding="utf-8", newline="")
        return output_path
