import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';

// Shared Settings Navigation Component
export function SettingsTabs() {
  const location = useLocation();
  const tabs = [
    { name: 'Profile Settings', path: '/settings' },
    { name: 'Team Management', path: '/settings/team' },
    { name: 'API & Integrations', path: '/settings/integrations' },
    { name: 'Company Settings', path: '/settings/company' },
    { name: 'Audit Logs', path: '/settings/audit-logs' },
  ];

  return (
    <div 
      style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--color-border)', 
        marginBottom: '24px', 
        gap: '24px', 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.name}
            to={tab.path}
            style={{
              padding: '12px 4px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              borderBottom: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
              textDecoration: 'none',
              marginBottom: '-1px',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}

export default function ProfileSettingsPage() {
  // Form State
  const [fullName, setFullName] = useState('John Doe');
  const [title, setTitle] = useState('Senior Recruiting Partner');
  const [dept, setDept] = useState('Talent Acquisition');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Toggles
  const [alerts, setAlerts] = useState(true);
  const [processing, setProcessing] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert('Personal information updated successfully.');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      alert('New passwords do not match.');
      return;
    }
    alert('Security credentials updated.');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  // Strength Helper
  const getPasswordStrength = () => {
    if (!newPw) return { text: '', color: '#E5E0D8', pct: 0 };
    if (newPw.length < 6) return { text: 'Weak', color: 'var(--color-brand)', pct: 33 };
    if (newPw.length < 10) return { text: 'Medium', color: 'var(--color-accent)', pct: 66 };
    return { text: 'Strong', color: '#28A745', pct: 100 };
  };

  const pwStrength = getPasswordStrength();

  return (
    <Layout pageTitle="Settings">
      <SettingsTabs />

      {/* Grid split */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '60fr 40fr',
          gap: '24px'
        }}
        className="grid-2"
      >
        {/* Left Side: Forms */}
        <div>
          {/* Card 1: Personal Info */}
          <div className="card">
            <h3 className="card-title">Personal Information</h3>
            
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div 
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-tag-bg)',
                    color: 'var(--color-brand)',
                    fontWeight: 700,
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  JD
                </div>
                <button type="button" className="btn btn-secondary btn-small" onClick={() => alert('Avatar picker triggered.')}>
                  Change Avatar
                </button>
              </div>

              <div className="form-group">
                <label className="text-label" htmlFor="profile-fullname">Full Name</label>
                <input 
                  id="profile-fullname"
                  type="text" 
                  className="input-field" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="text-label" htmlFor="profile-email">Work Email</label>
                <input 
                  id="profile-email"
                  type="email" 
                  className="input-field" 
                  disabled 
                  value="john.doe@nexus.ai" 
                />
                <span className="text-muted text-small" style={{ marginTop: '4px', display: 'block' }}>Email modification is locked for security compliance.</span>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="text-label" htmlFor="profile-jobtitle">Job Title</label>
                  <input 
                    id="profile-jobtitle"
                    type="text" 
                    className="input-field" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="text-label" htmlFor="profile-dept">Department</label>
                  <input 
                    id="profile-dept"
                    type="text" 
                    className="input-field" 
                    required
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                Save Changes
              </button>
            </form>
          </div>

          {/* Card 2: Password reset */}
          <div className="card">
            <h3 className="card-title">Change Password</h3>
            
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label className="text-label" htmlFor="profile-curpw">Current Password</label>
                <input 
                  id="profile-curpw"
                  type="password" 
                  className="input-field" 
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="text-label" htmlFor="profile-newpw">New Password</label>
                <input 
                  id="profile-newpw"
                  type="password" 
                  className="input-field" 
                  required
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
                {newPw && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Security Level</span>
                      <span style={{ color: pwStrength.color, fontWeight: 600 }}>{pwStrength.text}</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${pwStrength.pct}%`, backgroundColor: pwStrength.color, borderRadius: '2px' }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="text-label" htmlFor="profile-confpw">Confirm New Password</label>
                <input 
                  id="profile-confpw"
                  type="password" 
                  className="input-field" 
                  required
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Notification settings */}
        <div>
          <div className="card">
            <h3 className="card-title">Notification Preferences</h3>
            <p className="text-muted text-small" style={{ marginBottom: '20px' }}>Select which system notification digests you would like to receive.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Shortlist Ready Alerts</span>
                  <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>When AI algorithms finish scoring.</span>
                </div>
                <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} style={{ width: '40px', height: '20px', accentColor: 'var(--color-brand)' }} />
              </label>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }}></div>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Resume Parsing Compiles</span>
                  <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>When queue uploads finish processing.</span>
                </div>
                <input type="checkbox" checked={processing} onChange={(e) => setProcessing(e.target.checked)} style={{ width: '40px', height: '20px', accentColor: 'var(--color-brand)' }} />
              </label>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }}></div>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Weekly Analytics Digest</span>
                  <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>Aggregated executive system summaries.</span>
                </div>
                <input type="checkbox" checked={weeklySummary} onChange={(e) => setWeeklySummary(e.target.checked)} style={{ width: '40px', height: '20px', accentColor: 'var(--color-brand)' }} />
              </label>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }}></div>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>System Maintenance Alerts</span>
                  <span className="text-muted text-small" style={{ display: 'block', marginTop: '2px' }}>Downtime warning updates.</span>
                </div>
                <input type="checkbox" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} style={{ width: '40px', height: '20px', accentColor: 'var(--color-brand)' }} />
              </label>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
