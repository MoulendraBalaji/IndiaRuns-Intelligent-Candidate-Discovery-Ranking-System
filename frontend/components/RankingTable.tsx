'use client';

import React from 'react';

interface CandidateRank {
  candidate_id: string;
  final_score: number;
  rank_position: number;
  passed_gates: boolean;
  failed_dimensions: string[];
}

interface RankingTableProps {
  rankings: CandidateRank[];
  selectedId: string | null;
  onSelect: (candidateId: string) => void;
}

export default function RankingTable({ rankings, selectedId, onSelect }: RankingTableProps) {
  return (
    <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            <th style={{ padding: '1rem 0.5rem' }}>Rank</th>
            <th style={{ padding: '1rem 0.5rem' }}>Candidate ID</th>
            <th style={{ padding: '1rem 0.5rem' }}>Relevance Score</th>
            <th style={{ padding: '1rem 0.5rem' }}>Gate Status</th>
            <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((rank) => {
            const isSelected = selectedId === rank.candidate_id;
            return (
              <tr 
                key={rank.candidate_id} 
                onClick={() => onSelect(rank.candidate_id)}
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(0, 201, 224, 0.05)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                className="table-row-hover"
              >
                <td style={{ padding: '1.25rem 0.5rem', fontWeight: 'bold', color: 'var(--color-accent-cyan)' }}>
                  #{rank.rank_position}
                </td>
                <td style={{ padding: '1.25rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {rank.candidate_id.substring(0, 8)}... (Candidate)
                </td>
                <td style={{ padding: '1.25rem 0.5rem', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '40px',
                      height: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${rank.final_score * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--color-accent-cyan), var(--color-accent-purple))'
                      }} />
                    </div>
                    <span>{(rank.final_score * 100).toFixed(1)}%</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 0.5rem' }}>
                  {rank.passed_gates ? (
                    <span className="badge badge-green">Passed Gates</span>
                  ) : (
                    <span className="badge badge-red" title={`Failed: ${rank.failed_dimensions.join(', ')}`}>
                      Gate Failed ({rank.failed_dimensions.length})
                    </span>
                  )}
                </td>
                <td style={{ padding: '1.25rem 0.5rem', textAlign: 'right' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(rank.candidate_id);
                    }}
                  >
                    {isSelected ? 'Viewing' : 'Inspect'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
