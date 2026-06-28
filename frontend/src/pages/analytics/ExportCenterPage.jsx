import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { Download, Calendar, Mail, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function ExportCenterPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [format, setFormat] = useState('PDF');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Checkboxes
  const [includeScores, setIncludeScores] = useState(true);
  const [includeSkills, setIncludeSkills] = useState(true);
  const [includeExplain, setIncludeExplain] = useState(false);
  const [includeQs, setIncludeQs] = useState(false);
  const [includeRisks, setIncludeRisks] = useState(true);

  // Tables State
  const [schedules, setSchedules] = useState([
    { id: 'sch-1', name: 'Weekly Engineering Pipeline', freq: 'Every Friday', format: 'PDF', lastSent: 'June 26, 2026', status: 'Active' },
    { id: 'sch-2', name: 'Monthly Executive Audit Summary', freq: '1st of Month', format: 'CSV', lastSent: 'June 01, 2026', status: 'Active' }
  ]);

  const [exports, setExports] = useState([
    { id: 'exp-1', name: 'shortlist_frontend_architect.pdf', job: 'Senior Frontend Engineer', format: 'PDF', date: '2026-06-28 22:00', user: 'John Doe' },
    { id: 'exp-2', name: 'shortlist_ml_staff.csv', job: 'Staff Machine Learning Engineer', format: 'CSV', date: '2026-06-25 14:30', user: 'Samantha Vance' }
  ]);

  useEffect(() => {
    async function loadJobs() {
      const fetched = await api.getJobs();
      setJobs(fetched);
      if (fetched.length > 0) {
        setSelectedJobId(fetched[0].id);
      }
      setLoading(false);
    }
    loadJobs();
  }, []);

  const handleGenerateExport = async (e) => {
    e.preventDefault();
    setGenerating(true);

    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const selectedJobTitle = jobs.find(j => j.id === selectedJobId)?.title || 'Custom Shortlist';
    const cleanFileName = `shortlist_${selectedJobTitle.toLowerCase().replace(/\s/g, '_')}.${format.toLowerCase()}`;
    
    // Add to history
    const newExport = {
      id: `exp-${exports.length + 1}`,
      name: cleanFileName,
      job: selectedJobTitle,
      format,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'John Doe'
    };

    setExports(prev => [newExport, ...prev]);
    setGenerating(false);
    alert(`File "${cleanFileName}" successfully compiled and downloaded.`);
  };

  const handleCreateSchedule = () => {
    const name = prompt('Enter report schedule name:');
    if (!name) return;

    const newSch = {
      id: `sch-${schedules.length + 1}`,
      name,
      freq: 'Weekly (Every Monday)',
      format: 'PDF',
      lastSent: 'Never',
      status: 'Active'
    };

    setSchedules(prev => [...prev, newSch]);
  };

  return (
    <Layout pageTitle="Export Center">
      {/* Grid with 2 columns */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '6fr 4fr',
          gap: '24px'
        }}
        className="grid-2"
      >
        {/* Left Side: Forms */}
        <div>
          {/* Quick Export Card */}
          <div className="card">
            <h3 className="card-title">Export a Shortlist</h3>
            
            <form onSubmit={handleGenerateExport}>
              <div className="form-group">
                <label className="text-label" htmlFor="export-job-selector">Target Job Description</label>
                <select 
                  id="export-job-selector"
                  className="input-field"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  disabled={loading}
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>

              {/* Format selection */}
              <div className="form-group">
                <label className="text-label">Export File Format</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  {['CSV', 'JSON', 'PDF'].map(f => (
                    <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="format" 
                        checked={format === f}
                        onChange={() => setFormat(f)}
                        style={{ accentColor: 'var(--color-brand)' }}
                      />
                      <span style={{ fontWeight: format === f ? 600 : 400 }}>{f}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Checkboxes fields */}
              <div className="form-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <label className="text-label">Include Parameters</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeScores} onChange={(e) => setIncludeScores(e.target.checked)} style={{ accentColor: 'var(--color-brand)' }} />
                    <span style={{ fontSize: '13px' }}>Overall Fit Score breakdown</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeSkills} onChange={(e) => setIncludeSkills(e.target.checked)} style={{ accentColor: 'var(--color-brand)' }} />
                    <span style={{ fontSize: '13px' }}>Extracted Skills lists</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeExplain} onChange={(e) => setIncludeExplain(e.target.checked)} style={{ accentColor: 'var(--color-brand)' }} />
                    <span style={{ fontSize: '13px' }}>AI Explainability narratives</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeQs} onChange={(e) => setIncludeQs(e.target.checked)} style={{ accentColor: 'var(--color-brand)' }} />
                    <span style={{ fontSize: '13px' }}>Tailored Interview Questions</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeRisks} onChange={(e) => setIncludeRisks(e.target.checked)} style={{ accentColor: 'var(--color-brand)' }} />
                    <span style={{ fontSize: '13px' }}>Hiring Risk flag registers</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={generating} style={{ marginTop: '16px' }}>
                {generating ? (
                  <>
                    <Loader2 size={16} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                    <span>Compiling File...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Generate Export</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Scheduled Reports Card */}
          <div className="card">
            <h3 className="card-title">Scheduled Reports</h3>
            
            <div className="table-container mb-4">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Report Scope</th>
                    <th>Frequency</th>
                    <th>Format</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(sch => (
                    <tr key={sch.id}>
                      <td style={{ fontWeight: 500 }}>{sch.name}</td>
                      <td>{sch.freq}</td>
                      <td style={{ fontWeight: 600 }}>{sch.format}</td>
                      <td>
                        <span className="chip chip-success" style={{ fontSize: '10px' }}>{sch.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" className="btn btn-secondary btn-small" onClick={handleCreateSchedule}>
              Create Schedule
            </button>
          </div>
        </div>

        {/* Right Side: History logs */}
        <div>
          <div className="card">
            <h3 className="card-title">Export Log History</h3>
            <p className="text-muted text-small" style={{ marginBottom: '16px' }}>List of compilation files successfully downloaded in this workspace.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {exports.map(exp => (
                <div 
                  key={exp.id} 
                  style={{
                    padding: '16px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-page)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {exp.name}
                    </div>
                    <span className="chip" style={{ fontSize: '10px', padding: '1px 6px' }}>{exp.format}</span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    <div>Job context: {exp.job}</div>
                    <div style={{ marginTop: '2px' }}>Generated: {exp.date} by {exp.user}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '4px' }}>
                    <button 
                      onClick={() => alert(`Re-downloading ${exp.name}...`)}
                      className="btn btn-secondary btn-small"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Download size={10} />
                      <span>Download File</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
