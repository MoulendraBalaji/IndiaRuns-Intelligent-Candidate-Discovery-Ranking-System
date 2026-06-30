import os
import logging
from arq.connections import RedisSettings
from app.infrastructure.repositories.candidate_repo import CandidateRepository
from app.application.candidate_service import CandidateService

logger = logging.getLogger("arq_worker")

async def parse_and_index_candidate(ctx, tenant_id: str, filename: str, file_bytes: bytes) -> str:
    """
    Background job to parse candidate raw resume, execute features pipeline, 
    persist candidate details, and index in Qdrant vector database.
    """
    logger.info(f"Starting background parse and index for file: {filename}")
    
    # Initialize repositories and services
    candidate_repo = CandidateRepository()
    candidate_service = CandidateService(candidate_repo)
    
    # Run the upload and index logic
    try:
        profile = await candidate_service.upload_resume(
            tenant_id=tenant_id,
            filename=filename,
            file_bytes=file_bytes
        )
        logger.info(f"Successfully processed and indexed candidate: {profile.id}")
        return profile.id
    except Exception as e:
        logger.error(f"Failed background parsing for {filename}: {e}", exc_info=True)
        raise

async def startup(ctx):
    logger.info("ARQ Worker starting up...")

async def shutdown(ctx):
    logger.info("ARQ Worker shutting down...")

class WorkerSettings:
    """
    ARQ configuration settings read directly by python -m arq app.workers.arq_worker.WorkerSettings
    """
    redis_settings = RedisSettings.from_dsn(os.environ.get("REDIS_URL", "redis://localhost:6379"))
    functions = [parse_and_index_candidate]
    on_startup = startup
    on_shutdown = shutdown
