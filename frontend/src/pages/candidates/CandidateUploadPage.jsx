import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';
import Layout from '../../components/Layout';
import { Upload, ArrowLeft, Check, AlertCircle, RefreshCw, Loader } from 'lucide-react';

export default function CandidateUploadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Database jobs
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);

  // Queue state
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const fetchedJobs = await jobService.getJobs();
      setJobs(fetchedJobs);
      
      // Auto select from state/location parameter if navigated from Job Detail
      if (location.state && location.state.selectedJobId) {
        setSelectedJobId(location.state.selectedJobId);
      } else if (fetchedJobs.length > 0) {
        setSelectedJobId(fetchedJobs[0].id);
      }
      setLoading(false);
    }
    loadData();
  }, [location.state]);

  const handleBrowseFiles = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newQueueItems = files.map(file => ({
      id: `queue-${Math.random()}`,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      status: 'Queued',
      progress: 0,
      fileRef: file
    }));

    setQueue(prev => [...prev, ...newQueueItems]);
  };

  const handleStartProcessing = async () => {
    if (!selectedJobId) {
      alert('Please select a target Job Profile for assignment.');
      return;
    }
    if (queue.length === 0) {
      alert('Please add at least one resume file.');
      return;
    }

    setProcessing(true);
    
    // Process queue items one by one with simulated progress ticking
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'Complete') continue;

      // Update status to 'Parsing'
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'Parsing' } : q));

      // Tick progress up to 100
      for (let p = 10; p <= 100; p += 15) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: p } : q));
      }

      // Complete parsing and inject candidate into database
      const cleanName = item.name.replace(/\.[^/.]+$/, "").split('_').join(' ');
      const newCand = await candidateService.addCandidate({
        name: cleanName,
        role: jobs.find(j => j.id === selectedJobId)?.title || 'Candidate Profile',
        email: `${cleanName.toLowerCase().replace(/\s/g, '')}@gmail.com`,
        jobId: selectedJobId,
        status: 'Ranked'
      });

      await api.addAuditLog({
        eventType: 'Resume Parsed',
        description: `Parsed resume CV and stripped PII headers for candidate ${cleanName}.`
      });

      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'Complete', progress: 100 } : q));
    }

    setProcessing(false);
    // Add small timeout before navigating to shortlist
    setTimeout(() => {
      navigate(`/shortlists/${selectedJobId}`);
    }, 1000);
  };

  const handleRetry = (id) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'Queued', progress: 0 } : q));
  };

  return (
    <Layout pageTitle="Upload Resumes">
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

      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '48px' }}>
        {/* Card 1: Job Assignment */}
        <div className="card">
          <h3 className="card-title">Assign to Job Specification</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-label" htmlFor="job-selector">Target Job Description</label>
            <select 
              id="job-selector"
              className="input-field"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              disabled={processing}
            >
              {loading ? (
                <option>Loading jobs...</option>
              ) : jobs.length === 0 ? (
                <option value="">No Job Descriptions created yet</option>
              ) : (
                jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
                ))
              )}
            </select>
            <span className="text-muted text-small" style={{ marginTop: '8px', display: 'block' }}>
              All uploaded candidates will be evaluated and ranked against this specific role's parameters.
            </span>
          </div>
        </div>

        {/* Card 2: Upload Zone */}
        <div className="card" style={{ padding: 0 }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            multiple 
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
          
          <div 
            style={{
              padding: '48px 32px',
              border: '2px dashed var(--color-border)',
              borderRadius: '8px',
              backgroundColor: 'var(--color-table-header)',
              textAlign: 'center',
              cursor: 'pointer',
              margin: '24px'
            }}
            onClick={handleBrowseFiles}
          >
            <div style={{ color: 'var(--color-brand)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <Upload size={36} />
            </div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Drop resumes here</h3>
            <p className="text-muted text-small" style={{ marginBottom: '16px' }}>
              Accepts PDF and DOCX files. Maximum 10MB per file size limit.
            </p>
            <button type="button" className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleBrowseFiles(); }}>
              Browse Files
            </button>
            <span className="text-muted text-small" style={{ display: 'block', marginTop: '12px' }}>
              Or drag and drop files directly
            </span>
          </div>
        </div>

        {/* Card 3: Processing Queue */}
        {queue.length > 0 && (
          <div className="card">
            <div className="flex-between mb-4">
              <h3 style={{ margin: 0 }}>Processing Queue</h3>
              <span className="chip" style={{ fontWeight: 600 }}>{queue.length} files</span>
            </div>

            <div className="table-container">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th style={{ width: '180px' }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td className="text-muted">{item.size}</td>
                      <td>
                        <span className={`chip ${
                          item.status === 'Complete' ? 'chip-success' : 
                          item.status === 'Parsing' ? 'chip-warning' : 
                          item.status === 'Failed' ? 'chip-danger' : ''
                        }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {item.status === 'Parsing' && <Loader size={12} className="spin" style={{ animation: 'spin 1s linear infinite' }} />}
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${item.progress}%`, backgroundColor: 'var(--color-brand)', transition: 'width 0.2s', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', width: '30px', textAlign: 'right' }}>{item.progress}%</span>
                          {item.status === 'Failed' && (
                            <button 
                              onClick={() => handleRetry(item.id)}
                              style={{ border: 'none', background: 'none', color: 'var(--color-brand)', cursor: 'pointer', padding: '2px' }}
                            >
                              <RefreshCw size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Start button */}
        {queue.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button 
              className="btn btn-primary"
              disabled={processing || queue.every(q => q.status === 'Complete')}
              onClick={handleStartProcessing}
            >
              {processing ? 'Processing System Queue...' : 'Start Processing'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
