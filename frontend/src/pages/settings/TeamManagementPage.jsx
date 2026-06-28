import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { SettingsTabs } from './ProfileSettingsPage';
import { Plus, X, UserMinus, Shield } from 'lucide-react';

export default function TeamManagementPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Recruiter');
  const [inviteName, setInviteName] = useState('');

  useEffect(() => {
    async function loadTeam() {
      const data = await api.getTeam();
      setMembers(data);
      setLoading(false);
    }
    loadTeam();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newMember = await api.inviteTeamMember({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole
    });

    setMembers(prev => [...prev, newMember]);
    setModalOpen(false);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('Recruiter');

    await api.addAuditLog({
      eventType: 'User Invited',
      description: `Invited user ${inviteName} (${inviteEmail}) as ${inviteRole}.`
    });

    alert(`Invitation successfully sent to ${inviteEmail}.`);
  };

  const handleRoleChange = async (id, newRole) => {
    await api.updateTeamMemberRole(id, newRole);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    
    await api.addAuditLog({
      eventType: 'User Role Modified',
      description: `Modified role for user index ${id} to ${newRole}.`
    });
  };

  const handleRemove = async (id, name) => {
    if (confirm(`Are you sure you want to remove ${name} from this workspace?`)) {
      await api.removeTeamMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));

      await api.addAuditLog({
        eventType: 'User Removed',
        description: `Removed user ${name} (${id}) from workspace.`
      });
    }
  };

  const activeMembers = members.filter(m => m.status === 'Active');
  const pendingMembers = members.filter(m => m.status === 'Invited');

  return (
    <Layout pageTitle="Settings">
      <SettingsTabs />

      {/* Header and trigger */}
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>Team & Collaborators</h3>
        <button className="btn btn-primary btn-small" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Invite Member</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <span className="text-muted">Loading team list...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active members grid */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Active Members</h3>
            </div>
            
            <div className="table-container">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Collaborator Name</th>
                    <th>Permissions Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMembers.map(m => {
                    const initials = m.name.split(' ').map(n => n[0]).join('').toUpperCase();
                    return (
                      <tr key={m.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="user-avatar-initials" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{initials}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{m.name}</div>
                              <div className="text-muted text-small">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select 
                            className="input-field" 
                            style={{ width: '130px', padding: '4px 8px', fontSize: '12px' }}
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.id, e.target.value)}
                            disabled={m.id === 'team-1'} // Lock main admin role change
                          >
                            <option value="Admin">Admin</option>
                            <option value="Recruiter">Recruiter</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </td>
                        <td>
                          <span className="chip chip-success" style={{ fontSize: '11px' }}>{m.status}</span>
                        </td>
                        <td className="text-muted">{m.lastActive}</td>
                        <td style={{ textAlign: 'right' }}>
                          {m.id !== 'team-1' && (
                            <button
                              onClick={() => handleRemove(m.id, m.name)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer', padding: '4px' }}
                              title="Revoke Access"
                            >
                              <UserMinus size={15} />
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

          {/* Pending invites */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Pending Invites</h3>
            </div>
            
            {pendingMembers.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <span className="text-muted text-small">No outstanding team invites.</span>
              </div>
            ) : (
              <div className="table-container">
                <table className="nexus-table">
                  <thead>
                    <tr>
                      <th>Email Identifier</th>
                      <th>Assigned Role</th>
                      <th>Sent Time</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMembers.map(m => (
                      <tr key={m.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 600 }}>{m.name || 'Invited User'}</div>
                            <div className="text-muted text-small">{m.email}</div>
                          </div>
                        </td>
                        <td>
                          <span className="chip" style={{ fontSize: '11px', textTransform: 'capitalize' }}>{m.role}</span>
                        </td>
                        <td className="text-muted">Just now</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '16px' }}>
                            <button 
                              onClick={() => alert(`Resent workspace invitation to ${m.email}.`)}
                              className="btn btn-outline btn-small"
                              style={{ padding: '4px 8px', border: 'none', background: 'none' }}
                            >
                              Resend
                            </button>
                            <button 
                              onClick={() => handleRemove(m.id, m.email)}
                              className="btn btn-outline btn-small"
                              style={{ padding: '4px 8px', border: 'none', background: 'none', color: 'var(--color-brand)' }}
                            >
                              Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Invite Modal Overlay */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between mb-4">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="var(--color-brand)" />
                <span>Invite Team Collaborator</span>
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ border: 'none', background: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label className="text-label" htmlFor="invite-name-field">Full Name</label>
                <input 
                  id="invite-name-field"
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Alexis Vance"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="text-label" htmlFor="invite-email-field">Work Email</label>
                <input 
                  id="invite-email-field"
                  type="email" 
                  className="input-field" 
                  placeholder="name@company.com"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="text-label" htmlFor="invite-role-field">System Role Permissions</label>
                <select 
                  id="invite-role-field"
                  className="input-field"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="Admin">Admin (Full Write Access)</option>
                  <option value="Recruiter">Recruiter (Standard Evaluation)</option>
                  <option value="Viewer">Viewer (Read-Only shortlists)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
