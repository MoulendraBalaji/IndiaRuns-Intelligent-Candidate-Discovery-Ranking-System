import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { jobService } from '../../services/jobService';
import Layout from '../../components/Layout';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export default function CreateJobPage() {
  const navigate = useNavigate();

  // State Fields
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [seniority, setSeniority] = useState('Senior');
  const [description, setDescription] = useState('');

  // Toggles
  const [extractExpectations, setExtractExpectations] = useState(true);
  const [biasMitigation, setBiasMitigation] = useState(true);
  const [genQuestions, setGenQuestions] = useState(true);
  const [preset, setPreset] = useState('Balanced');

  // Loading Overlay
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const runAnalysis = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    
    // Simulate AI Agent running pipeline stages
    const stages = [
      'Reading and parsing job parameters...',
      'Running entity recognition for hard skills...',
      'Analyzing semantic context for hidden expectations...',
      'Mitigating compliance risks...',
      'Formulating tailored interview questions...',
      'Finalizing Job Intelligence profile...'
    ];

    for (let i = 0; i < stages.length; i++) {
      setStatusMessage(stages[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Save job using API
    const newJob = await jobService.createJob({
      title,
      department,
      seniority,
      description,
      status: 'Shortlist Ready', // Simulated as complete
      skillsRequired: ['React', 'JavaScript', 'HTML/CSS', 'System Architecture'],
      skillsPreferred: ['TypeScript', 'Vite', 'Redux'],
    });

    await api.addAuditLog({
      eventType: 'Job Analyzed',
      description: `Created and analyzed Job Profile for ${title}.`
    });

    setAnalyzing(false);
    navigate(`/jobs/${newJob.id}`);
  };

  const handleSaveDraft = async () => {
    if (!title) {
      alert('Please fill in at least the Job Title to save a draft.');
      return;
    }
    const newJob = await jobService.createJob({
      title,
      department,
      seniority,
      description,
      status: 'Draft',
      skillsRequired: [],
      skillsPreferred: [],
    });
    
    await api.addAuditLog({
      eventType: 'Job Created',
      description: `Created draft profile for ${title}.`
    });
    navigate('/jobs');
  };

  return (
    <Layout pageTitle="Create Job">
      {/* Header and Back Link */}
      <div style={{ marginBottom: '24px' }}>
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
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
        <form onSubmit={runAnalysis}>
          {/* Card 1: Job Info */}
          <div className="card">
            <h3 className="card-title">Job Information</h3>
            
            <div className="form-group">
              <label className="text-label" htmlFor="title-field">Job Title</label>
              <input 
                id="title-field"
                type="text" 
                className="input-field" 
                placeholder="e.g. Senior Frontend Architect" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="text-label" htmlFor="dept-field">Department</label>
                <select 
                  id="dept-field"
                  className="input-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="AI Research">AI Research</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="text-label" htmlFor="seniority-field">Seniority Level</label>
                <select 
                  id="seniority-field"
                  className="input-field"
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Staff">Staff</option>
                  <option value="Director">Director</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="text-label" htmlFor="desc-field">Job Description</label>
              <textarea 
                id="desc-field"
                className="input-field textarea-field" 
                style={{ minHeight: '300px' }}
                placeholder="Paste the full job description or requirements list here..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <span className="text-muted text-small" style={{ marginTop: '6px', display: 'block' }}>
                Accepts raw text or structured content. Minimum 100 words recommended for accurate extraction.
              </span>
            </div>
          </div>

          {/* Card 2: Settings */}
          <div className="card">
            <h3 className="card-title">Analysis Settings</h3>
            
            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Extract Hidden Expectations</span>
                  <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>Identify unstated core assumptions from wording and context.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={extractExpectations}
                  onChange={(e) => setExtractExpectations(e.target.checked)}
                  style={{ width: '40px', height: '20px', accentColor: 'var(--color-brand)' }}
                />
              </label>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }}></div>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Bias Mitigation</span>
                  <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>Ensure standard evaluation metrics bypass PII tags.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={biasMitigation}
                  onChange={(e) => setBiasMitigation(e.target.checked)}
                  style={{ width: '40px', height: '20px', accentColor: 'var(--color-brand)' }}
                />
              </label>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }}></div>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Generate Interview Questions</span>
                  <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>Produce direct interview question sets mapped to role skills.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={genQuestions}
                  onChange={(e) => setGenQuestions(e.target.checked)}
                  style={{ width: '40px', height: '20px', accentColor: 'var(--color-brand)' }}
                />
              </label>
            </div>

            {/* Presets */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
              <label className="text-label" style={{ marginBottom: '12px' }}>Ranking Weights Preset</label>
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  flexWrap: 'wrap'
                }}
              >
                {['Balanced', 'Technical Heavy', 'Leadership', 'Growth Focused'].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`btn ${preset === p ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, minWidth: '130px' }}
                    onClick={() => setPreset(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Actions Bar */}
          <div className="sticky-bottom-bar" style={{ position: 'fixed', left: 220, right: 0, bottom: 0, width: 'auto' }}>
            <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>
              Save as Draft
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} />
              <span>Analyze Job Description</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Modal Overlay */}
      {analyzing && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="mr-2" size={40} color="var(--color-brand)" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 20px auto' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>AI Job Intelligence Running</h3>
            <p className="text-muted text-small" style={{ minHeight: '20px' }}>{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Spinner keyframes */}
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
