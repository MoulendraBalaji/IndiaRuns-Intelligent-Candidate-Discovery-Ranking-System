import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { ArrowLeft, Download, ShieldCheck, HelpCircle, Eye, Sliders, ChevronDown } from 'lucide-react';

export default function RankedShortlistPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/Sort State
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Score');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const fetchedJob = await api.getJob(jobId);
      if (fetchedJob) {
        setJob(fetchedJob);
        const fetchedCands = await api.getCandidatesForJob(jobId);
        setCandidates(fetchedCands);
      }
      setLoading(false);
    }
    loadData();
  }, [jobId]);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('Shortlist exported successfully as CSV.');
    }, 1000);
  };

  const getProcessedCandidates = () => {
    // Filter
    let items = candidates.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
    );

    // Sort
    if (sortBy === 'Score') {
      items.sort((a, b) => b.overallScore - a.overallScore);
    } else if (sortBy === 'Authenticity') {
      items.sort((a, b) => b.authenticityScore - a.authenticityScore);
    } else if (sortBy === 'Experience') {
      const getVal = str => parseInt(str?.match(/\d+/)?.[0] || '0');
      items.sort((a, b) => getVal(b.experience) - getVal(a.experience));
    }

    return items;
  };

  if (loading) {
    return (
      <Layout pageTitle="Ranked Shortlist">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Calculating agent weights and rankings...</span>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout pageTitle="Shortlist Not Found">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3>Job Shortlist Not Found</h3>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  const processed = getProcessedCandidates();
  const totalScreened = candidates.length + 8; // Simulated aggregate
  const shortlistedCount = candidates.filter(c => c.status === 'Shortlisted').length;

  return (
    <Layout pageTitle="Job Shortlist">
      {/* Header and top-actions */}
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
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate(`/shortlists/${jobId}/config`)}
          >
            <Sliders size={15} />
            <span>Tune Weights</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download size={15} />
            <span>{exporting ? 'Exporting...' : 'Export List'}</span>
          </button>
        </div>
      </div>

      {/* Context bar */}
      <div 
        className="card"
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <span className="text-muted text-small">Total Screened</span>
            <div style={{ fontWeight: 700, fontSize: '16px', marginTop: '2px' }}>{totalScreened} candidates</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }}></div>
          <div>
            <span className="text-muted text-small">Shortlisted</span>
            <div style={{ fontWeight: 700, fontSize: '16px', marginTop: '2px' }}>{shortlistedCount} selected</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }}></div>
          <div>
            <span className="text-muted text-small">Completed Timestamp</span>
            <div style={{ fontWeight: 500, fontSize: '14px', marginTop: '4px' }}>June 28, 2026 - 22:15</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Search shortlist..." 
            className="input-field"
            style={{ width: '180px', padding: '6px 12px', fontSize: '13px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="input-field"
            style={{ width: '140px', padding: '6px 12px', fontSize: '13px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Score">Sort by Fit Score</option>
            <option value="Authenticity">Sort by Authenticity</option>
            <option value="Experience">Sort by Experience</option>
          </select>
        </div>
      </div>

      {/* Main candidates rank table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="nexus-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-table-header)' }}>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Candidate Name</th>
                <th>Overall Score</th>
                <th>Top Core Skills</th>
                <th>PII Authenticity</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processed.map((cand, index) => {
                const rankNum = index + 1;
                const isTopThree = rankNum <= 3;
                const initials = cand.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                
                return (
                  <tr key={cand.id}>
                    <td style={{ fontWeight: 700, color: isTopThree ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontSize: '16px' }}>
                      #{rankNum}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div 
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-tag-bg)',
                            color: 'var(--color-brand)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <Link to={`/candidates/${cand.id}`} style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>
                            {cand.name}
                          </Link>
                          <div className="text-muted text-small" style={{ marginTop: '2px' }}>{cand.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="score-container">
                        <span className="score-text" style={{ color: 'var(--color-brand)' }}>{cand.overallScore}</span>
                        <div className="score-bar-bg">
                          <div className="score-bar-fill" style={{ width: `${cand.overallScore}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {cand.skills?.core?.slice(0, 3).map((s, sIdx) => (
                          <span key={sIdx} className="chip">{s}</span>
                        )) || 'No skills parsed'}
                      </div>
                    </td>
                    <td>
                      <span className={`chip ${
                        cand.authenticityScore >= 90 ? 'chip-success' : 
                        cand.authenticityScore >= 70 ? 'chip-warning' : 'chip-danger'
                      }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {cand.authenticityScore >= 90 && <ShieldCheck size={12} />}
                        <span>{cand.authenticityScore}% Authenticity</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link 
                          to={`/candidates/${cand.id}`} 
                          className="btn btn-secondary btn-small"
                          style={{ padding: '6px 12px' }}
                        >
                          <Eye size={12} />
                          <span>View Profile</span>
                        </Link>
                        
                        <Link 
                          to={`/shortlists/${jobId}/explain/${cand.id}`} 
                          className="btn btn-outline btn-small"
                          style={{ padding: '6px 12px' }}
                        >
                          <HelpCircle size={12} />
                          <span>Explain Fit</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
