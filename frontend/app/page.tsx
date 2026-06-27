import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="text-glow-cyan" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-accent-cyan)' }}>
          Welcome to NEXUS
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Autonomous Talent Intelligence, Deterministic Cohort Ranking & Grounded Explainability
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>💼</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Job Positions</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', flex: 1 }}>
            Analyze Job Descriptions, extract implicit expectations, and manage your hiring requirements.
          </p>
          <Link href="/jobs" className="btn btn-cyan" style={{ width: '100%' }}>
            View Positions
          </Link>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>📄</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Candidate Resumes</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', flex: 1 }}>
            Upload resume PDFs to parse them automatically using AI-driven entity and feature builders.
          </p>
          <Link href="/candidates" className="btn btn-cyan" style={{ width: '100%' }}>
            Upload Resumes
          </Link>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🤖</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recruiter Copilot</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', flex: 1 }}>
            Chat with the candidate evaluation context. Ask comparisons, audit scores, and draft interview questions.
          </p>
          <Link href="/copilot" className="btn btn-cyan" style={{ width: '100%' }}>
            Launch Copilot
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '1rem', borderLeft: '4px solid var(--color-accent-purple)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Observability & Performance</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Track LLM latency, cache hit ratios, semantic search scoring, and vector indexing operations in real-time.
        </p>
        <Link href="/system" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Open System Monitor
        </Link>
      </div>
    </div>
  );
}
