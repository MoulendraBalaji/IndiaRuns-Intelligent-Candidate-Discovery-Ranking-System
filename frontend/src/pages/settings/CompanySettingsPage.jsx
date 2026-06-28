import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { SettingsTabs } from './ProfileSettingsPage';
import { ShieldAlert, Trash2, DownloadCloud, Check } from 'lucide-react';
import { api } from '../../services/api';

export default function CompanySettingsPage() {
  // Company Profile form
  const [companyName, setCompanyName] = useState('NEXUS Intelligent Recruiting');
  const [industry, setIndustry] = useState('Technology');
  const [size, setSize] = useState('51-200');
  const [website, setWebsite] = useState('https://nexus.ai');

  // Retention State
  const [retentionPeriod, setRetentionPeriod] = useState('90');
  const [autoDelete, setAutoDelete] = useState(true);

  // GDPR State
  const [candIdToDelete, setCandIdToDelete] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert('Company configuration profile updated.');
  };

  const handleSavePolicy = () => {
    alert(`Data retention schedules updated. Auto-deletion policy set to ${retentionPeriod} days.`);
  };

  const handleDeleteCandidateData = async (e) => {
    e.preventDefault();
    if (!candIdToDelete) return;

    // Check if candidate exists in mock database
    try {
      const db = JSON.parse(localStorage.getItem('nexus_mock_db') || '{}');
      const cand = db.candidates.find(c => c.id === candIdToDelete);
      if (!cand) {
        alert(`Error: Candidate with identifier "${candIdToDelete}" does not exist in workspace.`);
        return;
      }

      if (confirm(`Are you sure you want to permanently delete all data for candidate "${cand.name}" (${candIdToDelete})?`)) {
        db.candidates = db.candidates.filter(c => c.id !== candIdToDelete);
        localStorage.setItem('nexus_mock_db', JSON.stringify(db));
        
        await api.addAuditLog({
          eventType: 'GDPR Purge',
          description: `Cascaded permanent deletion for candidate ${cand.name} (${candIdToDelete}) across workspace nodes.`
        });

        alert(`GDPR Purge Successful: All records for ${cand.name} have been erased from DB.`);
        setCandIdToDelete('');
      }
    } catch (e) {
      alert('Error updating compliance logs.');
    }
  };

  return (
    <Layout pageTitle="Settings">
      <SettingsTabs />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', paddingBottom: '48px' }}>
        
        {/* Company Profile */}
        <div className="card">
          <h3 className="card-title">Company Profile</h3>
          
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="text-label" htmlFor="company-settings-name">Company Name</label>
              <input 
                id="company-settings-name"
                type="text" 
                className="input-field" 
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="text-label" htmlFor="company-settings-industry">Industry</label>
                <select 
                  id="company-settings-industry"
                  className="input-field"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance / VC</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>

              <div className="form-group">
                <label className="text-label" htmlFor="company-settings-size">Company Size</label>
                <select 
                  id="company-settings-size"
                  className="input-field"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option value="1-10">1 - 10 employees</option>
                  <option value="11-50">11 - 50 employees</option>
                  <option value="51-200">51 - 200 employees</option>
                  <option value="201-500">201 - 500 employees</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="text-label" htmlFor="company-settings-web">Website URL</label>
              <input 
                id="company-settings-web"
                type="url" 
                className="input-field" 
                required
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Save Workspace Profile
            </button>
          </form>
        </div>

        {/* Data Retention */}
        <div className="card">
          <h3 className="card-title">Candidate Data Retention Policy</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="text-label" htmlFor="retention-period-select">Auto-delete data after:</label>
              <select 
                id="retention-period-select"
                className="input-field"
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days (Recommended)</option>
                <option value="180">180 Days</option>
                <option value="365">365 Days</option>
              </select>
            </div>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <span style={{ fontWeight: 600 }}>Enable Automated Purges</span>
                <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>Automatically clean candidate profiles when they exceed retention thresholds.</span>
              </div>
              <input 
                type="checkbox" 
                checked={autoDelete} 
                onChange={(e) => setAutoDelete(e.target.checked)} 
                style={{ width: '40px', height: '20px', accentColor: 'var(--color-brand)' }} 
              />
            </label>

            <div>
              <button type="button" className="btn btn-secondary" onClick={handleSavePolicy}>
                Save Retention Policy
              </button>
            </div>
          </div>
        </div>

        {/* GDPR Compliance */}
        <div className="card">
          <h3 className="card-title">GDPR Compliance Tools</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span className="text-label">System Export Request</span>
              <button 
                type="button" 
                className="btn btn-secondary btn-small"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}
                onClick={() => alert('Compiling bulk candidate workspace archive for download.')}
              >
                <DownloadCloud size={14} />
                <span>Request Data Export</span>
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
              <span className="text-label">Erase Single Candidate Records (Right to be Forgotten)</span>
              
              <form onSubmit={handleDeleteCandidateData} style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Enter Candidate ID (e.g. cand-4)" 
                  required
                  value={candIdToDelete}
                  onChange={(e) => setCandIdToDelete(e.target.value)}
                  style={{ flex: 1 }}
                />
                
                <button type="submit" className="btn btn-outline" style={{ borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}>
                  Submit Deletion Request
                </button>
              </form>
              
              <span className="text-muted text-small" style={{ display: 'block', marginTop: '8px' }}>
                * Deletion triggers cascading purge operations across PostgreSQL, Qdrant indices, Redis, and MinIO storage buckets.
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'var(--color-brand)', backgroundColor: 'var(--color-nav-active)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-brand)', marginBottom: '12px' }}>
            <ShieldAlert size={20} />
            <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--color-brand)' }}>Danger Zone</h3>
          </div>

          <p className="text-muted text-small" style={{ color: 'var(--color-brand)', opacity: 0.9, marginBottom: '16px', lineHeight: 1.5 }}>
            Deleting your workspace company account is permanent. All job specifications, candidate profiles, evaluations, vector indices, and team invites will be permanently lost and cannot be recovered.
          </p>

          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ 
              borderColor: 'var(--color-brand)', 
              color: 'var(--color-brand)', 
              backgroundColor: 'var(--bg-card)',
              fontWeight: 600
            }}
            onClick={() => {
              if (confirm('WARNING: Are you absolutely sure you want to delete this company workspace? All active data will be purged immediately.')) {
                alert('Workspace deletion requested. Contact administration.');
              }
            }}
          >
            Delete Company Account
          </button>
        </div>

      </div>
    </Layout>
  );
}
