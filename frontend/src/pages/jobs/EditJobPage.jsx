import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [seniority, setSeniority] = useState('');
  const [description, setDescription] = useState('');

  // Toggles
  const [extractExpectations, setExtractExpectations] = useState(true);
  const [biasMitigation, setBiasMitigation] = useState(true);
  const [genQuestions, setGenQuestions] = useState(true);
  const [preset, setPreset] = useState('Balanced');

  // Loader State
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const fetchedJob = await api.getJob(id);
      if (fetchedJob) {
        setJob(fetchedJob);
        setTitle(fetchedJob.title);
        setDepartment(fetchedJob.department);
        setSeniority(fetchedJob.seniority);
        setDescription(fetchedJob.description);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleRestoreVersion = async (versionObj) => {
    if (confirm(`Are you sure you want to restore Version ${versionObj.version}?`)) {
      // In mock DB, we just update the version log and mock a restored alert
      alert(`Restored parameters to Version ${versionObj.version}`);
      navigate(`/jobs/${id}`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setAnalyzing(true);

    // Simulate AI pipeline
    await new Promise(resolve => setTimeout(resolve, 1500));

    await api.updateJob(id, {
      title,
      department,
      seniority,
      description,
      status: 'Shortlist Ready'
    });

    await api.addAuditLog({
      eventType: 'Job Re-analyzed',
      description: `Re-ran parsing and updated Job Profile for ${title} to v${(parseFloat(job.version) + 0.1).toFixed(1)}.`
    });

    setAnalyzing(false);
    navigate(`/jobs/${id}`);
  };

  if (loading) {
    return (
      <Layout pageTitle="Edit Job">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading job profile...</span>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout pageTitle="Job Not Found">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3>Job Profile Not Found</h3>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Jobs</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Edit Job description">
      <div style={{ marginBottom: '24px' }}>
        <Link 
          to={`/jobs/${id}`} 
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
          <span>Back to Job Details</span>
        </Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
        <form onSubmit={handleSave}>
          {/* Card 1: Form details */}
          <div className="card">
            <h3 className="card-title">Modify Specification</h3>
            
            <div className="form-group">
              <label className="text-label" htmlFor="job-title-input">Job Title</label>
              <input 
                id="job-title-input"
                type="text" 
                className="input-field" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="text-label" htmlFor="job-dept-input">Department</label>
                <select 
                  id="job-dept-input"
                  className="input-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="AI Research">AI Research</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div className="form-group">
                <label className="text-label" htmlFor="job-seniority-input">Seniority Level</label>
                <select 
                  id="job-seniority-input"
                  className="input-field"
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="text-label" htmlFor="job-desc-input">Job Description</label>
              <textarea 
                id="job-desc-input"
                className="input-field textarea-field"
                style={{ minHeight: '300px' }}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Card 2: Version History */}
          <div className="card">
            <h3 className="card-title">Version History</h3>
            
            <div className="table-container">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Date</th>
                    <th>Changes Summary</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {job.versions.map((ver, idx) => {
                    const isCurrent = ver.version === job.version;
                    return (
                      <tr 
                        key={idx}
                        style={{
                          borderLeft: isCurrent ? '3px solid var(--color-brand)' : 'none',
                          backgroundColor: isCurrent ? 'var(--color-nav-active)' : 'transparent'
                        }}
                      >
                        <td style={{ fontWeight: 600 }}>
                          v{ver.version} {isCurrent && <span style={{ fontSize: '10px', color: 'var(--color-brand)', fontWeight: 600, marginLeft: '6px' }}>(CURRENT)</span>}
                        </td>
                        <td className="text-muted">{ver.date}</td>
                        <td>{ver.changes}</td>
                        <td style={{ textAlign: 'right' }}>
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleRestoreVersion(ver)}
                              className="btn btn-outline btn-small"
                              style={{ border: 'none', background: 'none', padding: 0 }}
                            >
                              Restore
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky Actions Bar */}
          <div className="sticky-bottom-bar" style={{ position: 'fixed', left: 220, right: 0, bottom: 0, width: 'auto' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/jobs/${id}`)}>
              Discard Changes
            </button>
            <button type="submit" className="btn btn-primary">
              <RefreshCw size={16} />
              <span>Save as New Version</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Overlay */}
      {analyzing && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ border: '4px solid var(--color-border)', borderTop: '4px solid var(--color-brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }}></div>
            <h3>Re-running AI Job Analyzer</h3>
            <p className="text-muted text-small" style={{ marginTop: '8px' }}>Updating hidden expectations and question tables...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .sticky-bottom-bar {
            left: 0 !important;
          }
        }
      `}</style>
    </Layout>
  );
}
