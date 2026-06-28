import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { ArrowLeft, Edit3, HelpCircle, Copy, Check, Users, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [candidateCount, setCandidateCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Question sections toggles
  const [showTech, setShowTech] = useState(true);
  const [showBehavior, setShowBehavior] = useState(false);
  const [showCulture, setShowCulture] = useState(false);

  // Clipboard feedback state
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      const fetchedJob = await api.getJob(id);
      if (fetchedJob) {
        setJob(fetchedJob);
        const candidates = await api.getCandidatesForJob(id);
        setCandidateCount(candidates.length);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleCopyQuestion = (text, qId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(qId);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  if (loading) {
    return (
      <Layout pageTitle="Job Details">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading job details...</span>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout pageTitle="Job Not Found">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3>Job Profile Not Found</h3>
          <p className="text-muted" style={{ margin: '12px 0 24px 0' }}>The job ID you requested could not be resolved in this workspace.</p>
          <Link to="/jobs" className="btn btn-primary">Back to Jobs List</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Job Profile">
      {/* Header bar and sub-actions */}
      <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <Link 
          to="/jobs" 
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
          <span>Back to Jobs</span>
        </Link>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/jobs/${id}/edit`)}>
            <Edit3 size={15} />
            <span>Re-analyze</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/candidates/upload', { state: { selectedJobId: id } })}
          >
            Post to Candidates
          </button>
        </div>
      </div>

      {/* Title & Status */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '24px', margin: 0 }}>{job.title}</h2>
          <span className={`chip ${
            job.status === 'Shortlist Ready' ? 'chip-success' : 
            job.status === 'Processing' ? 'chip-warning' : 'chip-danger'
          }`}>
            {job.status}
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '65fr 35fr',
          gap: '24px'
        }}
        className="grid-2"
      >
        {/* Left Side: Job Intelligence Stack */}
        <div>
          {/* Card 1: Role Overview */}
          <div className="card">
            <h3 className="card-title">Role Overview</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className="text-label">Required Core Skills</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {job.skillsRequired.map((skill, idx) => (
                    <span key={idx} className="chip">{skill}</span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-label">Preferred Skills / Bonuses</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {job.skillsPreferred.map((skill, idx) => (
                    <span key={idx} className="chip" style={{ backgroundColor: '#F6F3EF' }}>{skill}</span>
                  ))}
                </div>
              </div>

              <div className="grid-2" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <div>
                  <span className="text-label">Experience Requirement</span>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginTop: '4px' }}>
                    {job.seniority === 'Senior' ? '5 - 8 Years' : job.seniority === 'Staff' ? '8+ Years' : '2 - 5 Years'}
                  </div>
                </div>
                <div>
                  <span className="text-label">Seniority Tier</span>
                  <span className="chip chip-warning" style={{ marginTop: '4px' }}>
                    {job.seniority} Level
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Hidden Expectations */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Hidden Expectations</h3>
              <div title="Unspoken requirements deduced by AI based on company profile and role context." style={{ cursor: 'help', color: 'var(--color-text-secondary)' }}>
                <HelpCircle size={16} />
              </div>
            </div>
            
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {job.hiddenExpectations.map((exp, idx) => (
                <li key={idx} style={{ lineHeight: 1.6 }}>{exp}</li>
              ))}
            </ul>
            <p className="text-muted" style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '16px' }}>
              * Not explicitly stated in JD but implied by context.
            </p>
          </div>

          {/* Card 3: Role Objectives */}
          <div className="card">
            <h3 className="card-title">Key Performance Objectives</h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {job.objectives.map((obj, idx) => (
                <li key={idx} style={{ lineHeight: 1.6 }}>{obj}</li>
              ))}
            </ul>
          </div>

          {/* Card 4: Interview Question Bank */}
          <div className="card">
            <h3 className="card-title">AI Interview Question Bank</h3>
            
            {/* Technical Questions */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', marginBottom: '12px', overflow: 'hidden' }}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-table-header)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                onClick={() => setShowTech(!showTech)}
              >
                <span>Technical Capabilities ({job.interviewQuestions.technical.length})</span>
                {showTech ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {showTech && (
                <div style={{ padding: '8px 16px' }}>
                  {job.interviewQuestions.technical.length === 0 ? (
                    <div className="text-muted text-small" style={{ padding: '8px 0' }}>No technical questions configured.</div>
                  ) : (
                    job.interviewQuestions.technical.map((q) => (
                      <div key={q.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                          <span style={{ fontWeight: 500 }}>{q.text}</span>
                          <button 
                            onClick={() => handleCopyQuestion(q.text, q.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', flexShrink: 0 }}
                          >
                            {copiedId === q.id ? <Check size={14} color="#28A745" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          Rationale: {q.rationale}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Behavioral Questions */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', marginBottom: '12px', overflow: 'hidden' }}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-table-header)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                onClick={() => setShowBehavior(!showBehavior)}
              >
                <span>Behavioral & Collaboration ({job.interviewQuestions.behavioral.length})</span>
                {showBehavior ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {showBehavior && (
                <div style={{ padding: '8px 16px' }}>
                  {job.interviewQuestions.behavioral.length === 0 ? (
                    <div className="text-muted text-small" style={{ padding: '12px 0' }}>No behavioral questions configured.</div>
                  ) : (
                    job.interviewQuestions.behavioral.map((q) => (
                      <div key={q.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                          <span style={{ fontWeight: 500 }}>{q.text}</span>
                          <button 
                            onClick={() => handleCopyQuestion(q.text, q.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', flexShrink: 0 }}
                          >
                            {copiedId === q.id ? <Check size={14} color="#28A745" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          Rationale: {q.rationale}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Culture Fit Questions */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-table-header)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                onClick={() => setShowCulture(!showCulture)}
              >
                <span>Culture Fit & Alignment ({job.interviewQuestions.culture.length})</span>
                {showCulture ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {showCulture && (
                <div style={{ padding: '8px 16px' }}>
                  {job.interviewQuestions.culture.length === 0 ? (
                    <div className="text-muted text-small" style={{ padding: '12px 0' }}>No culture fit questions configured.</div>
                  ) : (
                    job.interviewQuestions.culture.map((q) => (
                      <div key={q.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                          <span style={{ fontWeight: 500 }}>{q.text}</span>
                          <button 
                            onClick={() => handleCopyQuestion(q.text, q.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', flexShrink: 0 }}
                          >
                            {copiedId === q.id ? <Check size={14} color="#28A745" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          Rationale: {q.rationale}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar Metadata */}
        <div>
          {/* Metadata Card */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Profile Parameters</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div>
                <span className="text-label">Target Department</span>
                <span style={{ fontWeight: 600 }}>{job.department}</span>
              </div>
              <div>
                <span className="text-label">Created Date</span>
                <span style={{ fontWeight: 500 }}>{job.createdDate}</span>
              </div>
              <div>
                <span className="text-label">Schema Version</span>
                <span style={{ fontWeight: 600 }}>v{job.version}</span>
              </div>
              
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={20} color="var(--color-text-secondary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{candidateCount}</div>
                  <span className="text-muted text-small">Candidates Screened</span>
                </div>
              </div>

              {job.status === 'Shortlist Ready' && (
                <button 
                  className="btn btn-primary btn-full" 
                  style={{ marginTop: '8px' }}
                  onClick={() => navigate(`/shortlists/${id}`)}
                >
                  View Ranked Shortlist
                </button>
              )}
            </div>
          </div>

          {/* Red Flags Card */}
          <div className="card" style={{ borderColor: '#F5C6CB', backgroundColor: '#FFF5F5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#721C24', marginBottom: '12px' }}>
              <ShieldAlert size={18} />
              <h3 style={{ fontSize: '16px', margin: 0 }}>Automatic Risk Flags</h3>
            </div>
            
            {job.redFlags.length === 0 ? (
              <p className="text-muted text-small">No global alerts compiled for this role specification.</p>
            ) : (
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {job.redFlags.map((flag, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: '#721C24', lineHeight: 1.5 }}>
                    {flag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
