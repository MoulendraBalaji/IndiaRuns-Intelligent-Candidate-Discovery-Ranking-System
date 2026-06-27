'use client';

import React from 'react';

interface DimensionScore {
  id: string;
  score: number;
  weight: number;
  reasoning: string;
}

interface ScoreBreakdownProps {
  dimensions: Record<string, DimensionScore> | null;
}

const COLOR_MAP: Record<string, string> = {
  technical_fit: 'var(--color-accent-cyan)',
  project_fit: 'var(--color-accent-purple)',
  domain_fit: 'var(--color-accent-green)',
  experience_fit: 'var(--color-accent-gold)',
  behavior_fit: 'var(--color-accent-red)'
};

const DISPLAY_MAP: Record<string, string> = {
  technical_fit: 'Technical Skills Fit',
  project_fit: 'Project Complexity & Scale',
  domain_fit: 'Domain Expertise',
  experience_fit: 'Experience Duration Fit',
  behavior_fit: 'Behavior & Soft Skills'
};

export default function ScoreBreakdown({ dimensions }: ScoreBreakdownProps) {
  if (!dimensions) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
        No score breakdown available. Select a candidate.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Agent Score Breakdown</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(dimensions).map(([key, dim]) => {
          const color = COLOR_MAP[key] || 'var(--color-text-secondary)';
          const name = DISPLAY_MAP[key] || dim.id;
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600 }}>{name}</span>
                <span style={{ color: color, fontWeight: 'bold' }}>{(dim.score * 100).toFixed(0)}%</span>
              </div>
              <div style={{
                height: '8px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${dim.score * 100}%`,
                  height: '100%',
                  background: color,
                  borderRadius: '4px',
                  boxShadow: `0 0 10px ${color}`
                }} />
              </div>
              {dim.reasoning && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: '1.3' }}>
                  {dim.reasoning}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
