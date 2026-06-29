# NEXUS AI Hiring Intelligence Platform

NEXUS is a multi-agent, explainable AI hiring platform designed to evaluate candidates using deterministic ranking logic and structured LLM extraction.

## Architecture
The platform is built on a Domain-Driven Design (DDD) architecture, utilizing:
- **FastAPI** for async high-performance endpoints.
- **Qdrant** for semantic retrieval and vector search.
- **PostgreSQL** for relational data and Row-Level Security (RLS) tenant isolation.
- **Redis & ARQ** for background task queuing and caching.
- **MinIO** for S3-compatible file storage.

See the `docs/adr/` directory for detailed Architecture Decision Records.

## Quickstart

1. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
2. Start the development environment:
   ```bash
   docker compose up -d
   ```
3. The API will be available at `http://localhost:8000`.

## Development
This project uses `uv` for dependency management and `ruff`/`mypy` for linting and type checking.

```bash
make lint
make test
```

## Hackathon Submission

To generate the final competition submission (Deliverable #3), run the generation script from the project root. This orchestrates the dataset through the complete NEXUS pipeline, using Deterministic Ranking and creating reproducible outputs.

```bash
python scripts/generate_submission.py --team_id <your_team_id>
```

This will output the final ranked `.csv` file and a `submission_metadata.json` log into the `data/submissions/` directory.

To validate the generated CSV against the competition rules, run:
```bash
python dataset/validate_submission.py data/submissions/<your_team_id>.csv
```
