import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints.candidates import router as candidates_router
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.matching import router as matching_router
from app.api.v1.endpoints.copilot import router as copilot_router
from app.api.v1.endpoints.system import router as system_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NEXUS AI Talent Intelligence API",
    description="Production-grade API for candidate extraction, semantic matching, dynamic ranking, and explainability.",
    version="1.0.0"
)

# Configure CORS for local Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(candidates_router, prefix="/api/v1/candidates", tags=["Candidates"])
app.include_router(jobs_router, prefix="/api/v1/jobs", tags=["Jobs"])
# Mount matching router at v1 to capture /jobs/{id}/match and re-rank routes easily
app.include_router(matching_router, prefix="/api/v1", tags=["Matching"])
app.include_router(copilot_router, prefix="/api/v1/copilot", tags=["Copilot"])
app.include_router(system_router, prefix="/api/v1/system", tags=["System Observability"])

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "service": "NEXUS AI Talent Intelligence Platform",
        "version": "1.0.0"
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy"}
