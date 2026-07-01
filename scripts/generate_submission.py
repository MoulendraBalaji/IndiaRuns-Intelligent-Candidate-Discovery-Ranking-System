import argparse
import sys
from pathlib import Path
import os

# Add the root directory to PYTHONPATH so imports work
root_dir = Path(__file__).parent.parent
sys.path.append(str(root_dir))
sys.path.append(str(root_dir / 'backend'))

from dotenv import load_dotenv
load_dotenv(dotenv_path=root_dir / ".env")

# Change working directory to backend so all agents (and prompt loaders) initialize with the correct path
os.chdir(str(root_dir / "backend"))

from backend.services.submission_service import SubmissionService

def main():
    parser = argparse.ArgumentParser(description="Generate the top 100 candidate submission CSV.")
    parser.add_argument("--team_id", required=True, help="Your team ID / Participant ID for the submission filename.")
    parser.add_argument("--candidates", default=str(root_dir / "dataset/candidates.jsonl"), help="Path to candidates.jsonl")
    parser.add_argument("--job_description", default=str(root_dir / "dataset/job_description.docx"), help="Path to JD")
    parser.add_argument("--api_key", default=None, help="Optional Gemini API key to override the environment key.")
    
    args = parser.parse_args()
    
    # Configure API key priority: argument, then environment, fallback to "mock"
    if args.api_key:
        os.environ["GEMINI_API_KEY"] = args.api_key
    elif not os.environ.get("GEMINI_API_KEY"):
        os.environ["GEMINI_API_KEY"] = "mock"
        
    if not os.path.exists(args.candidates):
        print(f"Error: {args.candidates} not found.")
        sys.exit(1)
        
    print(f"Generating submission for team: {args.team_id}")
    
    # Resolve absolute paths first
    abs_candidates = str(Path(args.candidates).resolve())
    abs_jd = str(Path(args.job_description).resolve())
    abs_export_dir = str(root_dir / "data/submissions")
    
    # Instantiate service with absolute export directory
    service = SubmissionService(export_dir=abs_export_dir)
    
    csv_path = service.generate_submission(
        candidates_file=abs_candidates,
        job_description_file=abs_jd,
        team_id=args.team_id
    )
    
    print("\nSubmission generation complete!")
    print(f"Final output: {csv_path}")
    print("Please review the generated file and validate using dataset/validate_submission.py")
    sys.exit(0)

if __name__ == "__main__":
    main()
