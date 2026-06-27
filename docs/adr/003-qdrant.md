# ADR 003: Qdrant for Vector Search

## Status
Accepted

## Context
Semantic retrieval is necessary to quickly shortlist the Top-K candidates for a job description before passing them to the Evaluation Agent. We need a vector database to store BGE-M3 embeddings. Alternative options included PGVector, FAISS, and Pinecone.

## Decision
We chose **Qdrant** as our vector database.

## Consequences
- **Positive**: Qdrant offers excellent Rust-based performance, payload filtering (allowing us to filter candidates by `tenant_id`), and is open-source/self-hostable for easy local development via Docker.
- **Positive**: It handles metadata seamlessly, meaning we don't need a separate store just to map vector IDs to candidate metadata for filtering.
- **Negative**: Adds an additional service to the infrastructure compared to using PGVector in our existing PostgreSQL instance. However, PGVector can suffer performance issues at scale without proper index tuning, making Qdrant a safer choice for dedicated ANN search.
