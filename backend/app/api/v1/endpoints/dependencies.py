from app.infrastructure.repositories.candidate_repo import CandidateRepository
from app.infrastructure.repositories.job_repo import JobRepository
from app.infrastructure.repositories.matching_repo import MatchingRepository

from app.application.candidate_service import CandidateService
from app.application.job_service import JobService
from app.application.matching_service import MatchingService
from app.application.copilot_service import CopilotService

# Shared repositories
candidate_repo = CandidateRepository()
job_repo = JobRepository()
matching_repo = MatchingRepository()

# Shared services
candidate_service = CandidateService(candidate_repo)
job_service = JobService(job_repo)
matching_service = MatchingService(candidate_repo, job_repo, matching_repo)
copilot_service = CopilotService(matching_repo)
