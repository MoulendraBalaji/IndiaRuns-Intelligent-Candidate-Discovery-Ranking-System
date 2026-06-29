import argparse
import sys
from pathlib import Path
import os

# Add the root directory to PYTHONPATH so imports work
root_dir = Path(__file__).parent.parent
sys.path.append(str(root_dir))
sys.path.append(str(root_dir / 'backend'))

from backend.services.submission_service import SubmissionService

def main():
    parser = argparse.ArgumentParser(description="Generate the top 100 candidate submission CSV.")
    parser.add_argument("--team_id", required=True, help="Your team ID / Participant ID for the submission filename.")
    parser.add_argument("--candidates", default="dataset/candidates.jsonl", help="Path to candidates.jsonl")
    parser.add_argument("--job_description", default="dataset/Machine_Learning_Engineer_JD.pdf", help="Path to JD")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.candidates):
        print(f"Error: {args.candidates} not found.")
        sys.exit(1)
        
    print(f"Generating submission for team: {args.team_id}")
    
    service = SubmissionService()
    csv_path = service.generate_submission(
        candidates_file=args.candidates,
        job_description_file=args.job_description,
        team_id=args.team_id
    )
    
    print("\nSubmission generation complete!")
    print(f"Final output: {csv_path}")
    print("Please review the generated file and validate using dataset/validate_submission.py")

if __name__ == "__main__":
    main()
