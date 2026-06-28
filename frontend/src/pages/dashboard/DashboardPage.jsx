import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { Users, Briefcase, FileCheck, Percent, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const fetchedJobs = await api.getJobs();
      const fetchedCandidates = await api.getCandidates();
      setJobs(fetchedJobs);
      setCandidates(fetchedCandidates);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <Layout pageTitle="Dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading intelligence board...</span>
        </div>
      </Layout>
    );
  }

  // Calculate stats dynamically
  const totalCandidates = candidates.length;
  const activeJobs = jobs.filter(j => j.status !== 'Draft').length;
  const shortlistsReady = jobs.filter(j => j.status === 'Shortlist Ready').length;
  
  const rankedCandidates = candidates.filter(c => c.overallScore);
  const avgRankingScore = rankedCandidates.length 
    ? Math.round(rankedCandidates.reduce((acc, curr) => acc + curr.overallScore, 0) / rankedCandidates.length) 
    : 0;

  // Mock activity timelines
  const activityItems = [
    { text: 'Ranked Shortlist generated for Senior Frontend Engineer', time: '10 mins ago', active: true },
    { text: 'PII verification completed for Michael Chang', time: '1 hour ago', active: true },
    { text: 'Uploaded 4 candidates for Staff Machine Learning Engineer', time: '2 hours ago', active: true },
    { text: 'Job description modified (version 1.1) for Staff Machine Learning Engineer', time: '1 day ago', active: false },
    { text: 'New recruiter Alex Rivera invited to the workspace', time: '2 days ago', active: false },
    { text: 'Bias Mitigation verification passed', time: '3 days ago', active: false },
  ];

  return (
    <Layout pageTitle="Dashboard">
      {/* Stat Cards */}
      <div className="grid-4 mb-4">
        <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--color-tag-bg)', padding: '12px', borderRadius: '8px', color: 'var(--color-text-secondary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="text-muted text-small">Total Candidates</div>
            <h1 style={{ fontSize: '28px', marginTop: '4px' }}>{totalCandidates}</h1>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--color-tag-bg)', padding: '12px', borderRadius: '8px', color: 'var(--color-text-secondary)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="text-muted text-small">Active Jobs</div>
            <h1 style={{ fontSize: '28px', marginTop: '4px' }}>{activeJobs}</h1>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--color-tag-bg)', padding: '12px', borderRadius: '8px', color: 'var(--color-accent)' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="text-muted text-small">Shortlists Ready</span>
              <span 
                className="chip chip-warning" 
                style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px' }}
              >
                AI Ready
              </span>
            </div>
            <h1 style={{ fontSize: '28px', marginTop: '4px' }}>{shortlistsReady}</h1>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--color-tag-bg)', padding: '12px', borderRadius: '8px', color: 'var(--color-brand)' }}>
            <Percent size={24} />
          </div>
          <div>
            <div className="text-muted text-small">Avg Ranking Score</div>
            <h1 style={{ fontSize: '28px', marginTop: '4px', color: 'var(--color-brand)' }}>
              {avgRankingScore}<span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>/100</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '7fr 3fr',
          gap: '24px'
        }}
        className="grid-2"
      >
        {/* Left Side: Recent Jobs Table */}
        <div className="card" style={{ padding: '24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 16px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ margin: 0 }}>Recent Jobs</h3>
            <Link to="/jobs" style={{ color: 'var(--color-brand)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="nexus-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Candidates Screened</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((job) => {
                  // Count candidates for this job
                  const count = candidates.filter(c => c.jobId === job.id).length;
                  return (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/jobs/${job.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {job.title}
                        </Link>
                      </td>
                      <td>{count}</td>
                      <td>
                        <span className={`chip ${
                          job.status === 'Shortlist Ready' ? 'chip-success' : 
                          job.status === 'Processing' ? 'chip-warning' : 'chip-danger'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '13px' }}>{job.createdDate}</td>
                      <td>
                        {job.status === 'Shortlist Ready' ? (
                          <Link 
                            to={`/shortlists/${job.id}`} 
                            style={{ color: 'var(--color-brand)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
                          >
                            View Shortlist
                          </Link>
                        ) : (
                          <Link 
                            to={`/jobs/${job.id}`} 
                            style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '13px' }}
                          >
                            View Profile
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Activity Feed */}
        <div className="card">
          <h3 className="card-title">Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            {activityItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: item.active ? 'var(--color-brand)' : 'var(--color-accent)',
                      marginTop: '6px'
                    }}
                  ></div>
                  {idx < activityItems.length - 1 && (
                    <div style={{ width: '1px', flex: 1, backgroundColor: 'var(--color-border)', margin: '4px 0' }}></div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.text}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
