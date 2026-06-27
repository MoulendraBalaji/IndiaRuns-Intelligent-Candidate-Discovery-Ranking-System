'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface DimensionScore {
  id: string;
  score: number;
}

interface SkillRadarChartProps {
  dimensions: Record<string, DimensionScore> | null;
}

const DISPLAY_MAP: Record<string, string> = {
  technical_fit: 'Tech Fit',
  project_fit: 'Projects',
  domain_fit: 'Domain',
  experience_fit: 'Experience',
  behavior_fit: 'Soft Skills'
};

export default function SkillRadarChart({ dimensions }: SkillRadarChartProps) {
  if (!dimensions) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
        No radar data.
      </div>
    );
  }

  const data = Object.entries(dimensions).map(([key, dim]) => ({
    subject: DISPLAY_MAP[key] || dim.id,
    value: Math.round(dim.score * 100),
    fullMark: 100,
  }));

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, alignSelf: 'flex-start' }}>Capability Analysis</h3>
      <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--color-text-secondary)', fontSize: 8 }} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="var(--color-accent-cyan)"
              fill="var(--color-accent-cyan)"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
