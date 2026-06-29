import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';
import Layout from '../../components/Layout';
import { Search, Plus, Filter, Calendar, ChevronLeft, ChevronRight, AlertCircle, Trash } from 'lucide-react';

export default function JobsListPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function loadData() {
      const fetchedJobs = await jobService.getJobs();
      const fetchedCandidates = await candidateService.getCandidates();
      setJobs(fetchedJobs);
      setCandidates(fetchedCandidates);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDeleteJob = async (id) => {
    if (confirm('Are you sure you want to delete this job description?')) {
      try {
        const db = JSON.parse(localStorage.getItem('nexus_mock_db') || '{}');
        db.jobs = db.jobs.filter(j => j.id !== id);
        localStorage.setItem('nexus_mock_db', JSON.stringify(db));
        setJobs(db.jobs);
        
        await api.addAuditLog({
          eventType: 'Job Deleted',
          description: `Deleted job description for ${id}.`
        });
      } catch(e) {}
    }
  };

  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                            job.department.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'All') {
        const today = new Date();
        const created = new Date(job.createdDate);
        const diffTime = Math.abs(today - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateFilter === '7days') matchesDate = diffDays <= 7;
        else if (dateFilter === '30days') matchesDate = diffDays <= 30;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredJobs = getFilteredJobs();

  // Pagination math
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout pageTitle="Jobs">
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>Workspace Job Profiles</h3>
        <button className="btn btn-primary" onClick={() => navigate('/jobs/create')}>
          <Plus size={16} />
          <span>Create New Job</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div 
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          alignItems: 'center'
        }}
        className="grid-3"
      >
        <div style={{ position: 'relative', flex: 2 }}>
          <Search 
            size={18} 
            color="var(--color-text-secondary)" 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input 
            type="text" 
            placeholder="Search jobs by title or department..." 
            className="input-field" 
            style={{ paddingLeft: '38px' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          <select 
            className="input-field"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Statuses</option>
            <option value="Shortlist Ready">Shortlist Ready</option>
            <option value="Processing">Processing</option>
            <option value="Draft">Draft</option>
          </select>

          <select 
            className="input-field"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Dates</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading jobs...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--color-text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No jobs created yet</h3>
          <p className="text-muted text-small" style={{ margin: '8px 0 24px 0', maxWidth: '360px' }}>
            To begin using NEXUS, upload or paste a job description. Our AI agents will automatically build custom profiles.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs/create')}>
            + Create First Job
          </button>
        </div>
      ) : (
        <div>
          <div className="table-container mb-4">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Candidates Screened</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job) => {
                  const count = candidates.filter(c => c.jobId === job.id).length;
                  return (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/jobs/${job.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {job.title}
                        </Link>
                      </td>
                      <td className="text-muted">{job.department}</td>
                      <td>{count} candidates</td>
                      <td>
                        <span className={`chip ${
                          job.status === 'Shortlist Ready' ? 'chip-success' : 
                          job.status === 'Processing' ? 'chip-warning' : 'chip-danger'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="text-muted">{job.createdDate}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
                          <Link 
                            to={`/jobs/${job.id}`} 
                            style={{ color: 'var(--color-brand)', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}
                          >
                            View
                          </Link>
                          <Link 
                            to={`/jobs/${job.id}/edit`} 
                            style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '13px' }}
                          >
                            Re-analyze
                          </Link>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            style={{ background: 'none', border: 'none', color: '#DC3545', cursor: 'pointer', padding: '4px' }}
                            title="Delete Job"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted text-small">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
