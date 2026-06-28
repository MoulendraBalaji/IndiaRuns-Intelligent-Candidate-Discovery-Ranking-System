import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { Check, X, ShieldAlert, FileText, Download } from 'lucide-react';

export default function BiasAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      const fetchedLogs = await api.getAuditLogs();
      // Filter logs to only showing resume parsing / ranking events related to blind audits
      setLogs(fetchedLogs.filter(l => l.eventType === 'Resume Parsed' || l.eventType === 'Ranking Run'));
      setLoading(false);
    }
    loadLogs();
  }, []);

  const handleDownload = () => {
    alert('Full GDPR-compliant bias audit report downloaded.');
  };

  return (
    <Layout pageTitle="Bias Audit">
      {/* Header action */}
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>Compliance & Anonymization Audit</h3>
        <button className="btn btn-secondary btn-small" onClick={handleDownload}>
          <Download size={14} />
          <span>Download Full Audit</span>
        </button>
      </div>

      {/* Summary Row */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}
        >
          <div>
            <span className="text-muted text-small">Audits Run</span>
            <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '4px' }}>42 Verified Runs</div>
          </div>
          <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--color-border)' }}></div>
          
          <div>
            <span className="text-muted text-small">PII Fields Stripped</span>
            <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '4px' }}>5 Fields Stripped</div>
          </div>
          <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--color-border)' }}></div>

          <div>
            <span className="text-muted text-small">Ranking Operations</span>
            <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '4px' }}>100% Blind Mode</div>
          </div>
          <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--color-border)' }}></div>

          <div>
            <span className="text-muted text-small">Verification Status</span>
            <div style={{ marginTop: '4px' }}>
              <span className="chip chip-success" style={{ fontWeight: 600 }}>Active & Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* PII strip details checklist */}
      <div className="card">
        <h3 className="card-title">Fields Removed Before Ranking</h3>
        <p className="text-muted text-small" style={{ marginBottom: '16px' }}>
          To prevent demographic bias, the following parameters are fully masked in candidate records during evaluation runs.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['Candidate Name', 'Gender Identity', 'Photo Header', 'College Name / Alma Mater', 'Residential Address'].map((field, idx) => (
            <div 
              key={idx}
              className="chip chip-success"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <Check size={14} />
              <span>{field}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Audit Log Table</h3>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <span className="text-muted">Loading compliance database...</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Job Profile Context</th>
                  <th>Date & Timestamp</th>
                  <th>PII Masked Fields</th>
                  <th>Blind Ranking Verified</th>
                  <th>Triggered By</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>AUD-{log.id.replace('log-', '')}</td>
                    <td style={{ fontWeight: 500 }}>
                      {log.eventType === 'Ranking Run' ? 'Senior Frontend Engineer' : 'Staff ML Engineer'}
                    </td>
                    <td className="text-muted">{log.timestamp.replace('T', ' ').substring(0, 16)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span className="chip" style={{ fontSize: '10px' }}>Name</span>
                        <span className="chip" style={{ fontSize: '10px' }}>College</span>
                        <span className="chip" style={{ fontSize: '10px' }}>+3 more</span>
                      </div>
                    </td>
                    <td>
                      {log.status === 'Success' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#28A745', fontWeight: 600, fontSize: '13px' }}>
                          <Check size={14} />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-brand)', fontWeight: 600, fontSize: '13px' }}>
                          <X size={14} />
                          <span>Mismatch</span>
                        </div>
                      )}
                    </td>
                    <td className="text-muted">{log.recruiter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-muted" style={{ fontSize: '12px', fontStyle: 'italic', paddingLeft: '8px' }}>
        * All ranking operations are conducted on anonymized profiles. Identity parameters are restored in layout views only after the final shortlist is confirmed.
      </p>
    </Layout>
  );
}
