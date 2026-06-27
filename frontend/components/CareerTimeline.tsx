'use client';

import React from 'react';

interface ExperienceRole {
  title: string;
  company: string;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
  responsibilities: string[];
}

interface CareerTimelineProps {
  experience: ExperienceRole[];
}

export default function CareerTimeline({ experience }: CareerTimelineProps) {
  if (!experience || experience.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
        No career progression timeline data available.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Career Trajectory</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem' }}>
        
        {/* Timeline Line */}
        <div style={{
          position: 'absolute',
          left: '5px',
          top: '8px',
          bottom: '8px',
          width: '2px',
          background: 'linear-gradient(180deg, var(--color-accent-cyan) 0%, var(--color-accent-purple) 100%)',
          opacity: 0.5
        }} />

        {experience.map((role, idx) => (
          <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            
            {/* Timeline Dot */}
            <div style={{
              position: 'absolute',
              left: '-23px',
              top: '5px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: idx === 0 ? 'var(--color-accent-cyan)' : 'var(--color-accent-purple)',
              boxShadow: idx === 0 ? 'var(--shadow-glow-cyan)' : 'var(--shadow-glow-purple)',
              border: '2px solid var(--color-bg-surface)'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{role.title}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-cyan)', fontWeight: 600 }}>
                {role.start_date} &ndash; {role.end_date || 'Present'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {role.company} {role.duration_months ? `(${Math.round(role.duration_months / 12 * 10) / 10} yrs)` : ''}
            </div>

            {role.responsibilities && role.responsibilities.length > 0 && (
              <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.25rem' }}>
                {role.responsibilities.map((resp, rIdx) => (
                  <li key={rIdx}>{resp}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
