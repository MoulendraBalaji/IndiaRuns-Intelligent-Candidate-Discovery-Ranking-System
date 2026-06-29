import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { candidateService } from '../../services/candidateService';
import Layout from '../../components/Layout';
import { ArrowLeft, X, Layers, Plus, ExternalLink } from 'lucide-react';

export default function CandidateComparisonPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract selected IDs from Router State
  const passedIds = location.state?.candidateIds || ['cand-1', 'cand-2'];

  useEffect(() => {
    async function loadData() {
      const allCands = await candidateService.getCandidates();
      const matched = allCands.filter(c => passedIds.includes(c.id));
      setCandidates(matched);
      setLoading(false);
    }
    loadData();
  }, [location.state]);

  const handleRemoveCandidate = (id) => {
    if (candidates.length <= 1) {
      alert('You need at least 1 candidate to compare.');
      return;
    }
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCandidatePlaceholder = () => {
    alert('Select candidates from the Candidates List and trigger Compare.');
    navigate('/candidates');
  };

  // Helper to determine the "winning" score for highlight styling
  const getWinningCandidate = (field) => {
    if (candidates.length === 0) return null;
    let winner = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      if (candidates[i][field] > winner[field]) {
        winner = candidates[i];
      }
    }
    return winner.id;
  };

  const winningScoreId = getWinningCandidate('overallScore');
  const winningAuthId = getWinningCandidate('authenticityScore');

  if (loading) {
    return (
      <Layout pageTitle="Compare Candidates">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading candidate metrics...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Comparison matrix">
      {/* Back Link */}
      <div style={{ marginBottom: '24px' }}>
        <Link 
          to="/candidates" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Candidates</span>
        </Link>
      </div>

      <div style={{ marginBottom: '32px' }}>
        {/* Candidates Cards Row */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}
          className="grid-4"
        >
          {/* Column 1: Blank for Label Spacer */}
          <div className="card" style={{ border: 'none', background: 'none', boxShadow: 'none', display: 'flex', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', margin: 0 }}>Candidate Profile Overview</h3>
              <p className="text-muted text-small" style={{ marginTop: '6px' }}>Side-by-side assessment of parsed skills and metrics.</p>
            </div>
          </div>

          {/* Render Active Candidates */}
          {candidates.map((cand) => {
            const initials = cand.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div key={cand.id} className="card" style={{ position: 'relative', marginBottom: 0 }}>
                <button
                  type="button"
                  onClick={() => handleRemoveCandidate(cand.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-tag-bg)',
                      color: 'var(--color-brand)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', margin: 0 }}>{cand.name}</h4>
                    <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>{cand.role}</span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-brand)' }}>{cand.overallScore}</span>
                  <span className="text-muted text-small">/ 100</span>
                </div>
              </div>
            );
          })}

          {/* Placeholders for remaining slots up to 3 candidates */}
          {Array.from({ length: Math.max(0, 3 - candidates.length) }).map((_, idx) => (
            <div 
              key={idx}
              onClick={handleAddCandidatePlaceholder}
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: 'pointer',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--color-table-header)'
              }}
            >
              <Plus size={20} color="var(--color-text-secondary)" />
              <span className="text-muted text-small" style={{ marginTop: '8px' }}>Add slot for comparison</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="nexus-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-table-header)' }}>
                <th style={{ width: '25%', fontWeight: 600 }}>Parameters</th>
                {candidates.map(c => (
                  <th key={c.id} style={{ width: `${75 / candidates.length}%`, fontWeight: 600 }}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row: Overall Score */}
              <tr>
                <td style={{ fontWeight: 600 }}>Overall Fit Score</td>
                {candidates.map(c => {
                  const isWinner = c.id === winningScoreId;
                  return (
                    <td 
                      key={c.id}
                      style={{
                        backgroundColor: isWinner ? 'var(--color-nav-active)' : 'transparent',
                        color: isWinner ? 'var(--color-brand)' : 'inherit',
                        fontWeight: isWinner ? 700 : 400
                      }}
                    >
                      {c.overallScore} / 100
                    </td>
                  );
                })}
              </tr>

              {/* Row: Authenticity */}
              <tr>
                <td style={{ fontWeight: 600 }}>PII Authenticity</td>
                {candidates.map(c => {
                  const isWinner = c.id === winningAuthId;
                  return (
                    <td 
                      key={c.id}
                      style={{
                        backgroundColor: isWinner ? 'var(--color-nav-active)' : 'transparent',
                        color: isWinner ? 'var(--color-brand)' : 'inherit',
                        fontWeight: isWinner ? 700 : 400
                      }}
                    >
                      {c.authenticityScore}%
                    </td>
                  );
                })}
              </tr>

              {/* Row: Growth Potential */}
              <tr>
                <td style={{ fontWeight: 600 }}>Growth Potential</td>
                {candidates.map(c => (
                  <td key={c.id}>
                    <span className={`chip ${c.growthPotential === 'High Potential' ? 'chip-success' : 'chip-warning'}`}>
                      {c.growthPotential}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row: Experience */}
              <tr>
                <td style={{ fontWeight: 600 }}>Total Experience</td>
                {candidates.map(c => (
                  <td key={c.id} style={{ fontWeight: 500 }}>{c.experience}</td>
                ))}
              </tr>

              {/* Row: Top Skills */}
              <tr>
                <td style={{ fontWeight: 600 }}>Top Core Skills</td>
                {candidates.map(c => {
                  const skills = c.skills?.core || [];
                  return (
                    <td key={c.id}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {skills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="chip" style={{ fontSize: '11px' }}>{s}</span>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Recruiter Agent Match */}
              <tr>
                <td style={{ fontWeight: 600, paddingLeft: '24px' }} className="text-muted">↳ Recruiter Agent Match</td>
                {candidates.map(c => (
                  <td key={c.id} className="text-muted">90/100</td>
                ))}
              </tr>

              {/* Row: Hiring Manager Match */}
              <tr>
                <td style={{ fontWeight: 600, paddingLeft: '24px' }} className="text-muted">↳ Hiring Manager Match</td>
                {candidates.map(c => (
                  <td key={c.id} className="text-muted">85/100</td>
                ))}
              </tr>

              {/* Row: Behavioral Match */}
              <tr>
                <td style={{ fontWeight: 600, paddingLeft: '24px' }} className="text-muted">↳ Behavioral Fit Agent</td>
                {candidates.map(c => (
                  <td key={c.id} className="text-muted">95/100</td>
                ))}
              </tr>

              {/* Row: Strengths */}
              <tr>
                <td style={{ fontWeight: 600 }}>Key Advantage Summary</td>
                {candidates.map(c => (
                  <td key={c.id} style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    {c.id === 'cand-1' && 'Highly specialized in modern web performance profiling and layouts (Vite migrations).'}
                    {c.id === 'cand-2' && 'Excellent compliance mapping track records conforming to accessibility rules.'}
                    {c.id === 'cand-3' && 'Deep theoretical mathematical understanding and custom index structures development.'}
                    {(!['cand-1', 'cand-2', 'cand-3'].includes(c.id)) && 'General software development skills matches core profile objectives.'}
                  </td>
                ))}
              </tr>

              {/* Row: Hiring Risks */}
              <tr>
                <td style={{ fontWeight: 600 }}>Hiring Risks Flagged</td>
                {candidates.map(c => {
                  const risks = c.hiringRisks || [];
                  return (
                    <td key={c.id}>
                      {risks.length === 0 ? (
                        <span style={{ color: '#28A745', fontWeight: 600, fontSize: '13px' }}>None</span>
                      ) : (
                        <span style={{ color: 'var(--color-brand)', fontWeight: 600, fontSize: '13px' }}>
                          {risks.length} flagged
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Profile Redirects */}
              <tr>
                <td></td>
                {candidates.map(c => (
                  <td key={c.id}>
                    <Link 
                      to={`/candidates/${c.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--color-brand)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '13px'
                      }}
                    >
                      <span>View Full Profile</span>
                      <ExternalLink size={13} />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
