import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { Search, Plus, Filter, RefreshCw, Layers, CheckSquare, Square } from 'lucide-react';

export default function CandidatesListPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scoreRange, setScoreRange] = useState('All');
  const [experience, setExperience] = useState('All');

  // Candidate Selection for Comparison
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    async function loadData() {
      const fetchedCandidates = await api.getCandidates();
      const fetchedJobs = await api.getJobs();
      setCandidates(fetchedCandidates);
      setJobs(fetchedJobs);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleClearFilters = () => {
    setSearch('');
    setJobFilter('All');
    setStatusFilter('All');
    setScoreRange('All');
    setExperience('All');
  };

  const handleSelectCandidate = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 candidates at a time.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      alert('Select at least 2 candidates to compare.');
      return;
    }
    navigate('/candidates/compare', { state: { candidateIds: selectedIds } });
  };

  const getFilteredCandidates = () => {
    return candidates.filter(cand => {
      const matchesSearch = cand.name.toLowerCase().includes(search.toLowerCase()) ||
                            cand.role.toLowerCase().includes(search.toLowerCase()) ||
                            (cand.skills?.core && cand.skills.core.some(s => s.toLowerCase().includes(search.toLowerCase())));

      const matchesJob = jobFilter === 'All' || cand.jobId === jobFilter;
      const matchesStatus = statusFilter === 'All' || cand.status === statusFilter;

      let matchesScore = true;
      if (scoreRange !== 'All') {
        const val = cand.overallScore;
        if (scoreRange === '90+') matchesScore = val >= 90;
        else if (scoreRange === '80-89') matchesScore = val >= 80 && val < 90;
        else if (scoreRange === '70-79') matchesScore = val >= 70 && val < 80;
        else if (scoreRange === 'under70') matchesScore = val < 70;
      }

      let matchesExp = true;
      if (experience !== 'All') {
        const expStr = cand.experience || '';
        const expNum = parseInt(expStr.match(/\d+/)?.[0] || '0');
        if (experience === 'junior') matchesExp = expNum < 5;
        else if (experience === 'senior') matchesExp = expNum >= 5 && expNum < 8;
        else if (experience === 'lead') matchesExp = expNum >= 8;
      }

      return matchesSearch && matchesJob && matchesStatus && matchesScore && matchesExp;
    });
  };

  const filteredCandidates = getFilteredCandidates();

  return (
    <Layout pageTitle="Candidates">
      {/* Header and Actions */}
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>Candidate Pipeline</h3>
        <button className="btn btn-primary" onClick={() => navigate('/candidates/upload')}>
          <Plus size={16} />
          <span>Upload Resumes</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }} className="grid-3">
          <input 
            type="text" 
            placeholder="Search name, skills..." 
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <select className="input-field" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
            <option value="All">All Jobs</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>

          <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Ranked">Ranked</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select className="input-field" value={scoreRange} onChange={(e) => setScoreRange(e.target.value)}>
            <option value="All">All Scores</option>
            <option value="90+">90+ Excellent</option>
            <option value="80-89">80 - 89 Strong</option>
            <option value="70-79">70 - 79 Average</option>
            <option value="under70">Below 70</option>
          </select>

          <select className="input-field" value={experience} onChange={(e) => setExperience(e.target.value)}>
            <option value="All">Experience</option>
            <option value="junior">Junior (&lt; 5 yrs)</option>
            <option value="senior">Senior (5 - 8 yrs)</option>
            <option value="lead">Staff/Lead (8+ yrs)</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            type="button" 
            onClick={handleClearFilters}
            className="btn btn-secondary btn-small"
            style={{ border: 'none', background: 'none', padding: 0, color: 'var(--color-brand)', fontWeight: 600 }}
          >
            Clear filters
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading pipeline...</span>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <span className="text-muted text-small">No candidates match your active filter settings.</span>
        </div>
      ) : (
        <div>
          <div className="table-container mb-4">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Compare</th>
                  <th>Candidate Name</th>
                  <th>Job Applied</th>
                  <th>Overall Score</th>
                  <th>Top Core Skills</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((cand) => {
                  const jobName = jobs.find(j => j.id === cand.jobId)?.title || 'Unassigned';
                  const skillsList = cand.skills?.core || [];
                  const isChecked = selectedIds.includes(cand.id);
                  return (
                    <tr key={cand.id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleSelectCandidate(cand.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                        >
                          {isChecked ? <CheckSquare size={18} color="var(--color-brand)" /> : <Square size={18} color="var(--color-text-secondary)" />}
                        </button>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{cand.name}</div>
                        <span className="text-muted text-small">{cand.role}</span>
                      </td>
                      <td className="text-muted">{jobName}</td>
                      <td>
                        {cand.overallScore ? (
                          <div className="score-container">
                            <span className="score-text">{cand.overallScore}</span>
                            <div className="score-bar-bg">
                              <div className="score-bar-fill" style={{ width: `${cand.overallScore}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted text-small">Not scored</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {skillsList.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="chip">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`chip ${
                          cand.status === 'Shortlisted' ? 'chip-success' : 
                          cand.status === 'Ranked' ? 'chip-success' :
                          cand.status === 'Pending' ? 'chip-warning' : 'chip-danger'
                        }`} style={{
                          backgroundColor: cand.status === 'Ranked' ? '#E3F2FD' : '',
                          color: cand.status === 'Ranked' ? '#0D47A1' : ''
                        }}>
                          {cand.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link 
                          to={`/candidates/${cand.id}`} 
                          style={{ color: 'var(--color-brand)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Comparison Dispatcher Bar */}
      {selectedIds.length >= 2 && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--color-brand)',
            borderRadius: '8px',
            padding: '16px 24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          <div>
            <span style={{ fontWeight: 600 }}>{selectedIds.length} Candidates Selected</span>
            <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>Compare core skills and ratings side-by-side.</span>
          </div>
          <button className="btn btn-primary" onClick={handleCompare}>
            <Layers size={15} />
            <span>Compare Candidates</span>
          </button>
        </div>
      )}
    </Layout>
  );
}
