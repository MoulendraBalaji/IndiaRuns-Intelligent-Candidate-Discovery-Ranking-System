import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { jobService } from '../../services/jobService';
import Layout from '../../components/Layout';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';

export default function AdaptiveConfigPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Weight State
  const [recruiterWeight, setRecruiterWeight] = useState(40);
  const [hiringManagerWeight, setHiringManagerWeight] = useState(40);
  const [behavioralWeight, setBehavioralWeight] = useState(20);

  useEffect(() => {
    async function loadData() {
      const fetchedJob = await jobService.getJob(jobId);
      if (fetchedJob) {
        setJob(fetchedJob);
      }
      setLoading(false);
    }
    loadData();
  }, [jobId]);

  const total = Number(recruiterWeight) + Number(hiringManagerWeight) + Number(behavioralWeight);

  const applyPreset = (preset) => {
    if (preset === 'Balanced') {
      setRecruiterWeight(40);
      setHiringManagerWeight(40);
      setBehavioralWeight(20);
    } else if (preset === 'Technical Heavy') {
      setRecruiterWeight(15);
      setHiringManagerWeight(70);
      setBehavioralWeight(15);
    } else if (preset === 'Leadership') {
      setRecruiterWeight(40);
      setHiringManagerWeight(20);
      setBehavioralWeight(40);
    } else if (preset === 'Growth Focused') {
      setRecruiterWeight(20);
      setHiringManagerWeight(20);
      setBehavioralWeight(60);
    }
  };

  const handleSave = async () => {
    if (total !== 100) {
      alert('The weights must sum to exactly 100% before saving.');
      return;
    }

    // In a real app, update settings. For mock, write log
    await api.addAuditLog({
      eventType: 'Weights Tuned',
      description: `Re-calibrated evaluation agent weight configuration for ${job.title} to Recruiter: ${recruiterWeight}%, HM: ${hiringManagerWeight}%, Behavioral: ${behavioralWeight}%.`
    });

    alert('Tuned agent weights applied. Reranking candidate database now...');
    navigate(`/shortlists/${jobId}`);
  };

  if (loading) {
    return (
      <Layout pageTitle="Tuning Configuration">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading role calibration interface...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Tuning Configuration">
      {/* Back Link */}
      <div style={{ marginBottom: '24px' }}>
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
      </div>

      {/* Main split dashboard */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '60fr 40fr',
          gap: '24px'
        }}
        className="grid-2"
      >
        {/* Left Side: Tuners */}
        <div>
          {/* Sliders Card */}
          <div className="card">
            <h3 className="card-title">Agent Weight Distribution</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
              
              {/* Slider 1: Recruiter */}
              <div>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Recruiter Agent weight</span>
                  <span style={{ color: 'var(--color-brand)', fontWeight: 700 }}>{recruiterWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  step="5"
                  value={recruiterWeight}
                  onChange={(e) => setRecruiterWeight(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--color-brand)' }}
                />
                <span className="text-muted text-small" style={{ display: 'block', marginTop: '4px' }}>
                  Evaluates resume keyword relevance, tenure history, and background structures.
                </span>
              </div>

              {/* Slider 2: HM */}
              <div>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Hiring Manager Agent weight</span>
                  <span style={{ color: 'var(--color-brand)', fontWeight: 700 }}>{hiringManagerWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  step="5"
                  value={hiringManagerWeight}
                  onChange={(e) => setHiringManagerWeight(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--color-brand)' }}
                />
                <span className="text-muted text-small" style={{ display: 'block', marginTop: '4px' }}>
                  Focuses on code frameworks, libraries proficiency, and systems migration projects.
                </span>
              </div>

              {/* Slider 3: Behavioral */}
              <div>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Behavioral Fit Agent weight</span>
                  <span style={{ color: 'var(--color-brand)', fontWeight: 700 }}>{behavioralWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  step="5"
                  value={behavioralWeight}
                  onChange={(e) => setBehavioralWeight(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--color-brand)' }}
                />
                <span className="text-muted text-small" style={{ display: 'block', marginTop: '4px' }}>
                  Assesses soft skills, communication patterns, and ownership metrics.
                </span>
              </div>

              {/* Total counter constraint */}
              <div 
                style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span className="text-muted text-small">Constraint Check</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: total === 100 ? '#28A745' : 'var(--color-brand)' }}>
                    Total Sum: {total}%
                  </div>
                </div>
                
                {total !== 100 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-brand)', fontSize: '12px' }}>
                    <AlertTriangle size={16} />
                    <span>Weights must sum to 100%</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Quick Presets Card */}
          <div className="card">
            <h3 className="card-title">Quick Role Presets</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['Balanced', 'Technical Heavy', 'Leadership', 'Growth Focused'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="btn btn-secondary btn-small"
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Live Previews */}
        <div>
          <div className="card">
            <h3 className="card-title">Live Preview</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              
              {/* Bar 1 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Recruiter Agent</span>
                  <strong>{recruiterWeight}%</strong>
                </div>
                <div className="score-bar-bg" style={{ width: '100%' }}>
                  <div className="score-bar-fill" style={{ width: `${recruiterWeight}%` }}></div>
                </div>
              </div>

              {/* Bar 2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Hiring Manager</span>
                  <strong>{hiringManagerWeight}%</strong>
                </div>
                <div className="score-bar-bg" style={{ width: '100%' }}>
                  <div className="score-bar-fill" style={{ width: `${hiringManagerWeight}%` }}></div>
                </div>
              </div>

              {/* Bar 3 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Behavioral Agent</span>
                  <strong>{behavioralWeight}%</strong>
                </div>
                <div className="score-bar-bg" style={{ width: '100%' }}>
                  <div className="score-bar-fill" style={{ width: `${behavioralWeight}%` }}></div>
                </div>
              </div>

              <div 
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: 'var(--color-table-header)',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  {total === 100 ? (
                    <div>
                      {hiringManagerWeight > 50 && 'Ranking list is heavily prioritized for direct code syntax and database libraries. Best for screening hardcore execution capabilities.'}
                      {behavioralWeight > 50 && 'Ranking list favors soft skills, team collaboration history, and growth indices. Best for hiring product leads.'}
                      {recruiterWeight > 50 && 'Ranking list screens for tenure alignment, exact title matching, and general education specs.'}
                      {hiringManagerWeight <= 50 && behavioralWeight <= 50 && recruiterWeight <= 50 && 'Balanced analysis configuration. Weight indices spread equally.'}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--color-brand)' }}>Weights must sum to exactly 100% to run preview calibrations.</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-full"
                disabled={total !== 100}
                onClick={handleSave}
                style={{ marginTop: '16px' }}
              >
                Save & Apply Weights
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
