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
