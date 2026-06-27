# Stage 1: Base dependencies
FROM python:3.12-slim AS base
WORKDIR /app

# System dependencies for Docling, pdfplumber, BGE-M3 ONNX
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast package management
COPY --from=ghcr.io/astral-sh/uv:0.4.0 /uv /usr/local/bin/uv

COPY pyproject.toml .
# Normally we would run 'uv pip install' here but since we might just be scaffolding,
# we can use 'uv pip compile' or just install from a requirements format.
# If pyproject.toml is PEP 621 compliant, `uv pip install --system .` works.
RUN uv pip install --system --no-cache -e .

# Stage 2: Development
FROM base AS development
RUN uv pip install --system --no-cache watchfiles pytest ruff mypy
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app"]

# Stage 3: Production
FROM base AS production
COPY app/ ./app/

RUN useradd -r -s /bin/false nexus
USER nexus

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--timeout-keep-alive", "30"]
