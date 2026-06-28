import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { SettingsTabs } from './ProfileSettingsPage';
import { Key, Globe, Eye, EyeOff, Copy, Trash2, Plus } from 'lucide-react';

export default function IntegrationsPage() {
  const [keys, setKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Key Reveal states
  const [revealedIds, setRevealedIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // New Webhook Modal/Form
  const [showWhForm, setShowWhForm] = useState(false);
  const [whEvent, setWhEvent] = useState('Shortlist Ready');
  const [whUrl, setWhUrl] = useState('');

  useEffect(() => {
    async function loadData() {
      const fetchedKeys = await api.getApiKeys();
      const fetchedWh = await api.getWebhooks();
      setKeys(fetchedKeys);
      setWebhooks(fetchedWh);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleReveal = (id) => {
    setRevealedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopyKey = (val, id) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleGenerateKey = async () => {
    const name = prompt('Enter a label for the new API Key:');
    if (!name) return;

    const key = await api.generateApiKey(name);
    setKeys(prev => [...prev, key]);

    await api.addAuditLog({
      eventType: 'API Key Generated',
      description: `Generated new api token "${name}" (Identifier: ${key.id}).`
    });
  };

  const handleDeleteKey = async (id, name) => {
    if (confirm(`Are you sure you want to revoke "${name}" API Key?`)) {
      await api.deleteApiKey(id);
      setKeys(prev => prev.filter(k => k.id !== id));

      await api.addAuditLog({
        eventType: 'API Key Revoked',
        description: `Revoked api token "${name}".`
      });
    }
  };

  const handleAddWebhook = async (e) => {
    e.preventDefault();
    if (!whUrl) return;

    const wh = await api.addWebhook({
      event: whEvent,
      url: whUrl
    });

    setWebhooks(prev => [...prev, wh]);
    setShowWhForm(false);
    setWhUrl('');

    await api.addAuditLog({
      eventType: 'Webhook Configured',
      description: `Added target webhook listener to event "${whEvent}" directed to ${whUrl}.`
    });

    alert('Webhook listener registered.');
  };

  const handleDeleteWebhook = async (id, url) => {
    if (confirm(`Revoke webhook subscription for ${url}?`)) {
      await api.deleteWebhook(id);
      setWebhooks(prev => prev.filter(w => w.id !== id));

      await api.addAuditLog({
        eventType: 'Webhook Revoked',
        description: `Deleted webhook index pointing to ${url}.`
      });
    }
  };

  // Integrations v2 list
  const comingSoon = [
    { name: 'Slack Notifications', desc: 'Post rank alerts to channels.', category: 'Communication' },
    { name: 'Greenhouse ATS', desc: 'Sync candidate pipeline data.', category: 'ATS System' },
    { name: 'Lever Recruiter', desc: 'Push shortlists to archive lists.', category: 'ATS System' },
    { name: 'Workday Enterprise', desc: 'Enterprise organizational sync.', category: 'HR Suite' }
  ];

  return (
    <Layout pageTitle="Settings">
      <SettingsTabs />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <span className="text-muted">Loading integration configurations...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: API Keys */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Developer API Access Keys</h3>
            </div>

            <div className="table-container">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Key Identifier</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th>Secret Key Token</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map(k => {
                    const revealed = revealedIds.includes(k.id);
                    const maskValue = 'sk_live_' + '•'.repeat(8) + k.value.substring(k.value.length - 4);
                    return (
                      <tr key={k.id}>
                        <td style={{ fontWeight: 600 }}>{k.name}</td>
                        <td className="text-muted">{k.created}</td>
                        <td className="text-muted">{k.lastUsed}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{revealed ? k.value : maskValue}</span>
                            <button 
                              onClick={() => handleReveal(k.id)}
                              style={{ border: 'none', background: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '2px' }}
                            >
                              {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button 
                              onClick={() => handleCopyKey(k.value, k.id)}
                              style={{ border: 'none', background: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '2px' }}
                            >
                              {copiedId === k.id ? <Check size={14} color="#28A745" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteKey(k.id, k.name)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <button className="btn btn-secondary btn-small" onClick={handleGenerateKey}>
                Generate New Key
              </button>
              <span className="text-muted text-small" style={{ fontStyle: 'italic' }}>
                * Rotate credentials regularly. Never commit keys to public VCS repositories.
              </span>
            </div>
          </div>

          {/* Card 2: Webhooks */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Outgoing Event Webhooks</h3>
              {!showWhForm && (
                <button className="btn btn-secondary btn-small" onClick={() => setShowWhForm(true)}>
                  Add Webhook
                </button>
              )}
            </div>

            {/* Inlined Webhook Form */}
            {showWhForm && (
              <form onSubmit={handleAddWebhook} style={{ padding: '20px 24px', backgroundColor: 'var(--color-table-header)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '16px', alignItems: 'end' }} className="grid-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="text-label">Event Stream</label>
                    <select className="input-field" value={whEvent} onChange={(e) => setWhEvent(e.target.value)}>
                      <option value="Shortlist Ready">Shortlist Ready</option>
                      <option value="Resume Processed">Resume Processed</option>
                      <option value="Job Analyzed">Job Analyzed</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="text-label">Target Endpoint URL</label>
                    <input 
                      type="url" 
                      required 
                      placeholder="https://api.company.com/webhook" 
                      className="input-field" 
                      value={whUrl}
                      onChange={(e) => setWhUrl(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => setShowWhForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-small">Register</button>
                  </div>
                </div>
              </form>
            )}

            {webhooks.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <span className="text-muted text-small">No webhook endpoints registered.</span>
              </div>
            ) : (
              <div className="table-container">
                <table className="nexus-table">
                  <thead>
                    <tr>
                      <th>Event Trigger</th>
                      <th>Endpoint Target URL</th>
                      <th>Status</th>
                      <th>Last Dispatched</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map(w => (
                      <tr key={w.id}>
                        <td style={{ fontWeight: 600 }}>{w.event}</td>
                        <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '13px' }}>{w.url}</td>
                        <td>
                          <span className="chip chip-success" style={{ fontSize: '11px' }}>{w.status}</span>
                        </td>
                        <td className="text-muted">{w.lastTriggered}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteWebhook(w.id, w.url)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card 3: Integrations coming soon grid */}
          <div className="card">
            <h3 className="card-title">Available Ecosystem Integrations</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }} className="grid-2">
              {comingSoon.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-table-header)',
                    opacity: 0.7,
                    position: 'relative'
                  }}
                >
                  <span 
                    className="chip"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '9px',
                      padding: '1px 6px',
                      backgroundColor: 'var(--color-border)'
                    }}
                  >
                    Soon
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Globe size={16} color="var(--color-text-secondary)" />
                    <h4 style={{ fontSize: '13px', margin: 0 }}>{item.name}</h4>
                  </div>
                  <p className="text-muted" style={{ fontSize: '11px', lineHeight: 1.4 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
}
