import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { ArrowLeft, FileText, Check, AlertOctagon, HelpCircle, Briefcase, Calendar, MapPin, ExternalLink } from 'lucide-react';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('Overview');

  // Interactive shortlisting state
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const fetchedCand = await api.getCandidate(id);
      if (fetchedCand) {
        setCandidate(fetchedCand);
        setIsShortlisted(fetchedCand.status === 'Shortlisted');
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleToggleShortlist = async () => {
    const nextStatus = isShortlisted ? 'Ranked' : 'Shortlisted';
    await api.updateCandidateStatus(id, nextStatus);
    setIsShortlisted(!isShortlisted);
    
    await api.addAuditLog({
      eventType: 'Status Updated',
      description: `Updated status for ${candidate.name} to ${nextStatus}.`
    });
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('Candidate intelligence PDF report downloaded successfully.');
    }, 1200);
  };

  if (loading) {
    return (
      <Layout pageTitle="Candidate Details">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading candidate details...</span>
        </div>
      </Layout>
    );
  }

  if (!candidate) {
    return (
      <Layout pageTitle="Not Found">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3>Candidate Profile Not Found</h3>
          <Link to="/candidates" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Candidates</Link>
        </div>
      </Layout>
    );
  }

  // Get initials for avatar
  const initials = candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <Layout pageTitle="Candidate Report">
      {/* Header and top-actions */}
      <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <Link 
          to={candidate.jobId ? `/shortlists/${candidate.jobId}` : '/candidates'} 
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
          <span>Back to Shortlist</span>
        </Link>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Generating Report...' : 'Export Profile'}
          </button>
          
          <button 
            className={`btn ${isShortlisted ? 'btn-secondary' : 'btn-primary'}`} 
            onClick={handleToggleShortlist}
          >
            {isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
          </button>
        </div>
      </div>

      {/* Main split viewport */}
      <div 
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start'
        }}
        className="grid-2"
      >
        {/* Left Side: Summary Panel (280px wide) */}
        <div className="card" style={{ width: '280px', flexShrink: 0, padding: '24px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-tag-bg)',
                color: 'var(--color-brand)',
                fontSize: '22px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid var(--color-border)'
              }}
            >
              {initials}
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>{candidate.name}</h3>
            <span className="text-muted text-small">{candidate.role}</span>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '16px 0' }}></div>

          {/* Quick Metadata fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Total Experience</span>
              <span style={{ fontWeight: 600 }}>{candidate.experience || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Location</span>
              <span style={{ fontWeight: 600 }}>{candidate.location || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Notice Period</span>
              <span style={{ fontWeight: 600 }}>{candidate.noticePeriod || 'N/A'}</span>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '16px 0' }}></div>

          {/* Score metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span className="text-label" style={{ marginBottom: '4px' }}>Verification Score</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-brand)' }}>
                  {candidate.authenticityScore}%
                </span>
                <span className="text-muted" style={{ fontSize: '11px' }}>Evidence-backed</span>
              </div>
            </div>

            <div>
              <span className="text-label" style={{ marginBottom: '4px' }}>Growth Potential</span>
              <span 
                className="chip chip-warning" 
                style={{
                  backgroundColor: candidate.growthPotential === 'High Potential' ? 'var(--color-nav-active)' : '',
                  color: candidate.growthPotential === 'High Potential' ? 'var(--color-brand)' : '',
                  border: candidate.growthPotential === 'High Potential' ? '1px solid var(--color-brand)' : 'none'
                }}
              >
                {candidate.growthPotential || 'Standard'}
              </span>
            </div>

            <div>
              <span className="text-label" style={{ marginBottom: '4px' }}>AI Ranking Rank</span>
              <div style={{ fontWeight: 700 }}>
                #{candidate.rank || 2} of 12 candidates
              </div>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '16px 0' }}></div>

          {/* AI Summary */}
          <div>
            <span className="text-label" style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>AI Match Assessment</span>
            <p style={{ fontSize: '13px', lineHeight: 1.5, marginTop: '8px', color: 'var(--color-text-primary)' }}>
              {candidate.aiSummary || 'Profile parsing complete. Ready for manual review.'}
            </p>
          </div>
        </div>

        {/* Right Side: Main Detail Pages with Tabs */}
        <div style={{ flex: 1 }}>
          {/* Tab Navigation header */}
          <div 
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: '24px',
              gap: '24px'
            }}
          >
            {['Overview', 'Skills', 'Projects', 'Career Timeline', 'Hiring Risks'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: '12px 4px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                    borderBottom: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
                    cursor: 'pointer',
                    marginBottom: '-1px'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Overview */}
          {activeTab === 'Overview' && (
            <div>
              {/* Card: Why fits */}
              <div className="card">
                <h3 className="card-title" style={{ fontSize: '16px' }}>Why This Candidate Fits</h3>
                <p style={{ lineHeight: 1.6 }}>
                  Based on semantic extraction, the candidate shows {candidate.experience} of relevant industry experience in similar tech contexts. They have demonstrated leadership properties, high structural code hygiene, and align with {candidate.growthPotential === 'High Potential' ? 'rapid development targets' : 'balanced growth trajectories'}.
                </p>
              </div>

              {/* Card: Strengths */}
              <div className="card">
                <h3 className="card-title" style={{ fontSize: '16px' }}>Key Highlight Strengths</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>Lead Systems Migration</div>
                    <p className="text-muted text-small" style={{ marginTop: '4px' }}>Proven track record re-architecting complex dashboard structures, resulting in 40%+ performance gains.</p>
                  </div>
                  <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>Custom Design Systems Development</div>
                    <p className="text-muted text-small" style={{ marginTop: '4px' }}>Deep comfort coding structured vanilla CSS stylesheet rules and managing automated Figma API token assets.</p>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>Collaboration & Communication</div>
                    <p className="text-muted text-small" style={{ marginTop: '4px' }}>Strong peer-mentoring credentials and comfort explaining architecture details to cross-functional stakeholders.</p>
                  </div>
                </div>
              </div>

              {/* Grid with Score & Radar */}
              <div className="grid-2">
                {/* SVG Radar Graphic */}
                <div className="card">
                  <h3 className="card-title" style={{ fontSize: '16px' }}>Skill Radar Fit</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                    <svg width="180" height="180" viewBox="0 0 100 100">
                      {/* Grid Circles */}
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="25" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="10" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
                      
                      {/* Axis Lines */}
                      <line x1="50" y1="10" x2="50" y2="90" stroke="var(--color-border)" strokeWidth="0.5" />
                      <line x1="10" y1="50" x2="90" y2="50" stroke="var(--color-border)" strokeWidth="0.5" />
                      
                      {/* Radar Shape */}
                      <polygon 
                        points="50,22 80,50 50,75 25,50" 
                        fill="rgba(192, 24, 42, 0.15)" 
                        stroke="var(--color-brand)" 
                        strokeWidth="1.5" 
                      />
                      
                      {/* Labels */}
                      <text x="50" y="8" fontSize="5" textAnchor="middle" fontWeight="bold">React</text>
                      <text x="94" y="52" fontSize="5" textAnchor="start" fontWeight="bold">CSS</text>
                      <text x="50" y="96" fontSize="5" textAnchor="middle" fontWeight="bold">Testing</text>
                      <text x="6" y="52" fontSize="5" textAnchor="end" fontWeight="bold">System</text>
                    </svg>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="card">
                  <h3 className="card-title" style={{ fontSize: '16px' }}>Evaluation Agent Scores</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <div className="flex-between text-small" style={{ marginBottom: '4px' }}>
                        <span>Recruiter Agent Match</span>
                        <strong>90/100</strong>
                      </div>
                      <div className="score-bar-bg" style={{ width: '100%' }}>
                        <div className="score-bar-fill" style={{ width: '90%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex-between text-small" style={{ marginBottom: '4px' }}>
                        <span>Hiring Manager Assessment</span>
                        <strong>85/100</strong>
                      </div>
                      <div className="score-bar-bg" style={{ width: '100%' }}>
                        <div className="score-bar-fill" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex-between text-small" style={{ marginBottom: '4px' }}>
                        <span>Behavioral Fit Agent</span>
                        <strong>95/100</strong>
                      </div>
                      <div className="score-bar-bg" style={{ width: '100%' }}>
                        <div className="score-bar-fill" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Skills */}
          {activeTab === 'Skills' && (
            <div className="card">
              <h3 className="card-title">Skills Inventory</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <span className="text-label" style={{ marginBottom: '8px' }}>Core Engineering Skills</span>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {candidate.skills?.core?.map((skill, idx) => (
                      <span key={idx} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-brand)' }}></div>
                        <span>{skill}</span>
                      </span>
                    )) || 'No core skills parsed.'}
                  </div>
                </div>

                <div>
                  <span className="text-label" style={{ marginBottom: '8px' }}>Frameworks & Infrastructure</span>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {candidate.skills?.frameworks?.map((skill, idx) => (
                      <span key={idx} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }}></div>
                        <span>{skill}</span>
                      </span>
                    )) || 'No frameworks parsed.'}
                  </div>
                </div>

                <div>
                  <span className="text-label" style={{ marginBottom: '8px' }}>Soft Skills & Operations</span>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {candidate.skills?.soft?.map((skill, idx) => (
                      <span key={idx} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-text-secondary)' }}></div>
                        <span>{skill}</span>
                      </span>
                    )) || 'No soft skills parsed.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Projects */}
          {activeTab === 'Projects' && (
            <div>
              {candidate.projects && candidate.projects.length > 0 ? (
                candidate.projects.map((proj, idx) => (
                  <div key={idx} className="card">
                    <div className="flex-between">
                      <h3 style={{ fontSize: '16px', margin: 0 }}>{proj.name}</h3>
                      <ExternalLink size={14} color="var(--color-text-secondary)" />
                    </div>
                    <p style={{ margin: '10px 0', lineHeight: 1.5 }}>{proj.description}</p>
                    
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {proj.tech.map((t, tIdx) => (
                        <span key={tIdx} className="chip" style={{ fontSize: '11px' }}>{t}</span>
                      ))}
                    </div>
                    
                    <div 
                      style={{ 
                        borderTop: '1px solid var(--color-border)', 
                        paddingTop: '10px', 
                        fontSize: '13px', 
                        color: 'var(--color-text-secondary)',
                        fontStyle: 'italic'
                      }}
                    >
                      Impact: {proj.impact}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                  <span className="text-muted text-small">No structured project records resolved in candidate resume file.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Career Timeline */}
          {activeTab === 'Career Timeline' && (
            <div className="card">
              <h3 className="card-title">Professional Experience Log</h3>
              
              {candidate.timeline && candidate.timeline.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
                  {candidate.timeline.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div 
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-brand)',
                            border: '3px solid var(--color-nav-active)'
                          }}
                        ></div>
                        {idx < candidate.timeline.length - 1 && (
                          <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--color-border)', margin: '4px 0' }}></div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.role}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.company} | <span style={{ fontWeight: 500 }}>{item.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <span className="text-muted text-small">Timeline records not extracted.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Hiring Risks */}
          {activeTab === 'Hiring Risks' && (
            <div className="card">
              <h3 className="card-title">Hiring Risk Warnings</h3>
              
              {candidate.hiringRisks && candidate.hiringRisks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {candidate.hiringRisks.map((risk, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '16px',
                        border: '1px solid #F5C6CB',
                        borderRadius: '6px',
                        backgroundColor: '#FFF5F5',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <AlertOctagon size={20} color="var(--color-brand)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#721C24' }}>
                          {risk.title}
                          <span 
                            className="chip chip-danger"
                            style={{
                              marginLeft: '8px',
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '3px'
                            }}
                          >
                            {risk.severity} Risk
                          </span>
                        </div>
                        <p className="text-muted text-small" style={{ marginTop: '6px', color: '#721C24', opacity: 0.85 }}>
                          {risk.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Check size={32} color="#28A745" style={{ marginBottom: '8px' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Clear Profile Assessment</h4>
                  <p className="text-muted text-small" style={{ marginTop: '4px' }}>No significant compliance, PII verification, or tenure issues flagged on this profile.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
