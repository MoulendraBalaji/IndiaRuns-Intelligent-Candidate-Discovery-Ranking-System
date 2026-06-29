import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';
import Layout from '../../components/Layout';
import { ArrowLeft, Copy, Check, FileCheck, ShieldAlert, Sparkles, Database } from 'lucide-react';

export default function ShortlistExplainPage() {
  const { jobId, candidateId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Questions tab
  const [activeQTab, setActiveQTab] = useState('Technical');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      const fetchedJob = await jobService.getJob(jobId);
      const fetchedCand = await candidateService.getCandidate(candidateId);
      if (fetchedJob && fetchedCand) {
        setJob(fetchedJob);
        setCandidate(fetchedCand);
      }
      setLoading(false);
    }
    loadData();
  }, [jobId, candidateId]);

  const handleCopy = (text, qId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(qId);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  if (loading) {
    return (
      <Layout pageTitle="Explainability Report">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading explainability trail...</span>
        </div>
      </Layout>
    );
  }

  if (!job || !candidate) {
    return (
      <Layout pageTitle="Not Found">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3>Report Data Not Found</h3>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  // Mock Skill Gaps
  const skillGaps = [
    { skill: 'React Architecture', required: 'Expert', candidate: 'Expert', severity: 'None', color: 'chip-success' },
    { skill: 'Webpack Optimization', required: 'Strong', candidate: 'Basic (Prefers Vite)', severity: 'Low', color: 'chip-warning' },
    { skill: 'TypeScript Typing', required: 'Strong', candidate: 'Moderate', severity: 'Low', color: 'chip-warning' },
  ];

  // Tailored Questions
  const questions = {
    Technical: [
      { id: 'q-1', text: 'You mention migrating a Webpack project to Vite. What specific build optimizations did you do, and how did you resolve circular dependency issues?', rationale: 'Directly validates their stated migration experience on similar scale architectures.' },
      { id: 'q-2', text: 'How do you structure custom design system stylesheets in a vanilla CSS environment to prevent scope collisions?', rationale: 'Tests details matching our vanilla styling requirements.' }
    ],
    Behavioral: [
      { id: 'q-3', text: 'Describe a situation where a product designer insisted on a layout that broke responsiveness guidelines. How did you negotiate?', rationale: 'Measures structural communication and design compliance skills.' }
    ],
    Culture: [
      { id: 'q-4', text: 'We prioritize clean layout styling rules with zero animation bloat. How does this align with your design philosophies?', rationale: 'Measures direct alignment with NEXUS editorial UI requirements.' }
    ]
  };

  // Evidence Trail Logs
  const evidenceLogs = [
    { claim: 'Led migration from Webpack to Vite', source: 'Core Admin Dashboard Project (Line 23)', confidence: '95%' },
    { claim: '6 Years frontend experience', source: 'WebFlow Corp & SaaSify (Employment History)', confidence: '98%' },
    { claim: 'Engineered custom Figma variables compiler', source: 'Design Tokens Compiler (Resume Projects)', confidence: '92%' },
  ];

  return (
    <Layout pageTitle="Explainability Report">
      {/* Header and top buttons */}
      <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <Link 
          to={`/shortlists/${jobId}`} 
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
          <button className="btn btn-secondary" onClick={() => alert('PDF generation scheduled.')}>Export PDF</button>
          <button className="btn btn-primary" onClick={() => { alert('Added to workspace final candidate list.'); navigate(`/shortlists/${jobId}`); }}>
            Add to Final List
          </button>
        </div>
      </div>

      {/* Main Column */}
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '48px' }}>
        
        {/* Banner Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', backgroundColor: 'var(--color-nav-active)', borderColor: 'var(--color-brand)' }}>
          <Sparkles size={24} color="var(--color-brand)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{candidate.name}</h3>
            <span className="text-muted text-small">AI Match Score: <strong>{candidate.overallScore}/100</strong> — Rank #{candidate.rank}</span>
          </div>
        </div>

        {/* Fit Summary */}
        <div className="card">
          <h3 className="card-title">Why NEXUS Selected This Candidate</h3>
          <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
            The candidate demonstrates exceptional alignment with the technical parameters of the {job.title} specification. They have hands-on experience rebuilding administration dashboard templates, migrating bundler pipelines, and building modular design system components. Verification checks show high claim reliability with no structural inconsistencies.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="chip">Vite Migrations</span>
            <span className="chip">Performance Gains</span>
            <span className="chip">Design Token Compilers</span>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="card">
          <h3 className="card-title">Skill Gaps Identified</h3>
          <div className="table-container">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th>Target Parameter</th>
                  <th>JD Expectation</th>
                  <th>Candidate Assessment</th>
                  <th>Gap Status</th>
                </tr>
              </thead>
              <tbody>
                {skillGaps.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{item.skill}</td>
                    <td>{item.required}</td>
                    <td>{item.candidate}</td>
                    <td>
                      <span className={`chip ${item.color}`}>{item.severity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hiring Risks */}
        <div className="card">
          <h3 className="card-title">Hiring Risks Warnings</h3>
          {candidate.hiringRisks.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#155724', backgroundColor: '#D4EDDA', padding: '12px 16px', borderRadius: '6px', border: '1px solid #C3E6CB' }}>
              <FileCheck size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>No significant hiring risks or anomalies identified.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {candidate.hiringRisks.map((risk, idx) => (
                <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: '6px', padding: '16px', display: 'flex', gap: '12px' }}>
                  <ShieldAlert size={18} color="var(--color-brand)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-brand)' }}>{risk.title}</div>
                    <p className="text-muted text-small" style={{ marginTop: '4px' }}>{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Questions */}
        <div className="card">
          <h3 className="card-title">Recommended Interview Questions</h3>
          
          {/* Inner Question Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '16px', marginBottom: '16px' }}>
            {['Technical', 'Behavioral', 'Culture'].map(tab => {
              const active = activeQTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveQTab(tab)}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: '8px 4px',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                    borderBottom: active ? '2px solid var(--color-brand)' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions[activeQTab].map((q, idx) => (
              <div key={q.id} style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                  <span style={{ fontWeight: 600 }}>{idx + 1}. {q.text}</span>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(q.text, q.id)}
                    style={{ border: 'none', background: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                  >
                    {copiedId === q.id ? <Check size={14} color="#28A745" /> : <Copy size={14} />}
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '8px', display: 'flex', gap: '4px' }}>
                  <strong>Rationale:</strong>
                  <span>{q.rationale}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Log */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Database size={18} color="var(--color-text-secondary)" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Evidence Trail Verification</h3>
          </div>

          <div className="table-container">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th>Claim Profile</th>
                  <th>Source Provenance</th>
                  <th>Confidence Score</th>
                </tr>
              </thead>
              <tbody>
                {evidenceLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{log.claim}</td>
                    <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.source}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-brand)' }}>{log.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="text-muted text-small" style={{ display: 'block', marginTop: '12px', fontStyle: 'italic' }}>
            * All claims derived from the candidate's own resume content files.
          </span>
        </div>

      </div>
    </Layout>
  );
}
