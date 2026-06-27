.PHONY: up down build logs shell test lint format check install

# Docker commands
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f backend worker

shell:
	docker compose exec backend bash

# Local dev commands (requires uv installed locally)
install:
	cd backend && uv pip install -e ".[dev]"

test:
	cd backend && uv run pytest

lint:
	cd backend && uv run ruff check .

format:
	cd backend && uv run ruff format .

check: lint test
	cd backend && uv run mypy app/
