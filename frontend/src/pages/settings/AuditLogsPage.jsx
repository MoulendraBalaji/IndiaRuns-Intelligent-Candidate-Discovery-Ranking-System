import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { SettingsTabs } from './ProfileSettingsPage';
import { Search, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [recruiter, setRecruiter] = useState('All');
  const [eventType, setEventType] = useState('All');

  // Expanded row tracker
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function loadLogs() {
      const data = await api.getAuditLogs();
      setLogs(data);
      setLoading(false);
    }
    loadLogs();
  }, []);

  const handleExport = () => {
    alert('System operations logs archive exported.');
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) ||
                            log.eventType.toLowerCase().includes(search.toLowerCase());
      
      const matchesRecruiter = recruiter === 'All' || log.recruiter === recruiter;
      const matchesType = eventType === 'All' || log.eventType === eventType;

      return matchesSearch && matchesRecruiter && matchesType;
    });
  };

  const filtered = getFilteredLogs();

  return (
    <Layout pageTitle="Settings">
      <SettingsTabs />

      {/* Header filter actions */}
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>System Operations Audit</h3>
        <button className="btn btn-secondary btn-small" onClick={handleExport}>
          <Download size={14} />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div 
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          alignItems: 'center'
        }}
        className="grid-3"
      >
        <div style={{ position: 'relative', flex: 2 }}>
          <Search 
            size={16} 
            color="var(--color-text-secondary)" 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input 
            type="text" 
            placeholder="Search logs by description..." 
            className="input-field"
            style={{ paddingLeft: '38px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          <select className="input-field" value={recruiter} onChange={(e) => setRecruiter(e.target.value)}>
            <option value="All">All Users</option>
            <option value="John Doe">John Doe</option>
            <option value="Samantha Vance">Samantha Vance</option>
            <option value="Alex Rivera">Alex Rivera</option>
          </select>

          <select className="input-field" value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="All">All Events</option>
            <option value="Ranking Run">Ranking Runs</option>
            <option value="Resume Parsed">Resume Parsed</option>
            <option value="Job Analyzed">Job Analyzed</option>
            <option value="Login">Login Audits</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <span className="text-muted">Loading audit databases...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <span className="text-muted text-small">No system events matched.</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}></th>
                  <th>Timestamp</th>
                  <th>Recruiter</th>
                  <th>Event Type</th>
                  <th>Description</th>
                  <th>IP Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        onClick={() => toggleExpand(log.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td className="text-muted" style={{ fontSize: '13px' }}>
                          {log.timestamp.replace('T', ' ').substring(0, 19)}
                        </td>
                        <td style={{ fontWeight: 600 }}>{log.recruiter}</td>
                        <td>
                          <span className="chip" style={{ fontSize: '11px' }}>{log.eventType}</span>
                        </td>
                        <td>{log.description}</td>
                        <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.ip}</td>
                        <td>
                          <span className={`chip ${log.status === 'Success' ? 'chip-success' : 'chip-danger'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ backgroundColor: 'var(--color-table-header)', padding: '16px 32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <strong style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Event Model Payload Details:</strong>
                              <pre 
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '11px',
                                  color: 'var(--color-text-secondary)',
                                  backgroundColor: 'var(--bg-card)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '4px',
                                  padding: '12px',
                                  margin: 0,
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: 1.4
                                }}
                              >
                                {log.details}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <span className="text-muted text-small" style={{ fontStyle: 'italic', display: 'block', marginTop: '12px', paddingLeft: '8px' }}>
        * Logs are retained for 90 days by default. Configure retention policy details in Company Settings.
      </span>
    </Layout>
  );
}
