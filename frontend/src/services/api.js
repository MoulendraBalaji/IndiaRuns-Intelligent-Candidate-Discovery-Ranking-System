import { API_BASE, getAuthHeaders, fetchWrapper } from './config';

// Rich Mock Datasets to keep the UI interactive and visually premium during the demo
const INITIAL_NOTIFICATIONS = [
  { id: 'notif-1', title: 'Shortlist Ready', description: 'AI Shortlist ranking is ready for Senior Frontend Engineer.', type: 'shortlist', timestamp: '10m ago', unread: true },
  { id: 'notif-2', title: 'Processing Resumes', description: 'Parsed and indexed 15 resumes for Staff Machine Learning Engineer.', type: 'processing', timestamp: '2h ago', unread: true },
  { id: 'notif-3', title: 'System Maintenance', description: 'PII-anonymization services will be updated tonight at 11 PM EST.', type: 'system', timestamp: '1d ago', unread: false }
];

const INITIAL_TEAM = [
  { id: 'team-1', name: 'John Doe', email: 'john.doe@nexus.ai', role: 'Admin', status: 'Active', lastActive: 'Online now' },
  { id: 'team-2', name: 'Samantha Vance', email: 'samantha.v@nexus.ai', role: 'Recruiter', status: 'Active', lastActive: '2h ago' },
  { id: 'team-3', name: 'Alex Rivera', email: 'alex.r@nexus.ai', role: 'Viewer', status: 'Invited', lastActive: 'Never' }
];

const INITIAL_API_KEYS = [
  { id: 'key-1', name: 'Production RAG Client', created: '2026-06-01', lastUsed: '5m ago', status: 'Active', value: 'sk_live_123456789abcde' },
  { id: 'key-2', name: 'Staging Integration', created: '2026-06-15', lastUsed: '1d ago', status: 'Active', value: 'sk_live_987654321fedcb' }
];

const INITIAL_WEBHOOKS = [
  { id: 'wh-1', event: 'Shortlist Ready', url: 'https://api.company.com/webhooks/nexus-shortlists', status: 'Active', lastTriggered: '10m ago' },
  { id: 'wh-2', event: 'Resume Processed', url: 'https://api.company.com/webhooks/nexus-resumes', status: 'Inactive', lastTriggered: '3d ago' }
];

const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', timestamp: '2026-06-28T21:40:02Z', recruiter: 'John Doe', eventType: 'Ranking Run', description: 'Calculated agent weights and ranked 4 candidates for Senior Frontend Engineer.', model: 'Nexus-Rank-v2.1', ip: '192.168.1.45', status: 'Success', details: '{\n  "jobId": "job-1",\n  "weights": {\n    "recruiter": 40,\n    "hiringManager": 40,\n    "behavioral": 20\n  },\n  "candidates_scored": 2\n}' },
  { id: 'log-2', timestamp: '2026-06-28T19:30:15Z', recruiter: 'Samantha Vance', eventType: 'Resume Parsed', description: 'Successfully parsed and stripped PII details from Sarah_Jenkins_CV.pdf.', model: 'Nexus-Parse-v1.4', ip: '192.168.1.112', status: 'Success', details: '{\n  "fileName": "Sarah_Jenkins_CV.pdf",\n  "pii_stripped": ["Name", "Email", "Location", "College Name"]\n}' },
  { id: 'log-3', timestamp: '2026-06-28T18:15:22Z', recruiter: 'Alex Rivera', eventType: 'Login', description: 'User login verification from unknown IP.', model: 'Auth-Gate-v2.0', ip: '103.54.21.90', status: 'Failed', details: '{\n  "reason": "Invalid password signature"\n}' }
];

// Helper to load/save from localStorage
const getMockData = (key, defaultVal) => {
  const stored = localStorage.getItem(`nexus_mock_${key}`);
  if (!stored) {
    localStorage.setItem(`nexus_mock_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(stored);
};

const saveMockData = (key, val) => {
  localStorage.setItem(`nexus_mock_${key}`, JSON.stringify(val));
};

export const api = {
  // AUTH (Stubbed)
  login: async (email, password) => {
    return { token: 'stub-token', user: { name: 'Admin', email } };
  },
  onboardWorkspace: async (token, onboardingData) => {
    return { token: 'stub-token' };
  },

  // NOTIFICATIONS
  getNotifications: async () => {
    return getMockData('notifications', INITIAL_NOTIFICATIONS);
  },
  markAllNotificationsRead: async () => {
    const notifs = getMockData('notifications', INITIAL_NOTIFICATIONS).map(n => ({ ...n, unread: false }));
    saveMockData('notifications', notifs);
    return notifs;
  },

  // TEAM MANAGEMENT
  getTeam: async () => {
    return getMockData('team', INITIAL_TEAM);
  },
  inviteTeamMember: async (member) => {
    const team = getMockData('team', INITIAL_TEAM);
    const newMember = {
      id: `team-${team.length + 1}`,
      status: 'Invited',
      lastActive: 'Never',
      ...member
    };
    team.push(newMember);
    saveMockData('team', team);
    return newMember;
  },
  removeTeamMember: async (id) => {
    let team = getMockData('team', INITIAL_TEAM);
    team = team.filter(m => m.id !== id);
    saveMockData('team', team);
    return true;
  },
  updateTeamMemberRole: async (id, role) => {
    const team = getMockData('team', INITIAL_TEAM);
    const m = team.find(t => t.id === id);
    if (m) {
      m.role = role;
      saveMockData('team', team);
    }
    return m;
  },

  // API KEYS & WEBHOOKS
  getApiKeys: async () => {
    return getMockData('apiKeys', INITIAL_API_KEYS);
  },
  generateApiKey: async (name) => {
    const keys = getMockData('apiKeys', INITIAL_API_KEYS);
    const key = {
      id: `key-${keys.length + 1}`,
      name,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'Active',
      value: `sk_live_${Math.random().toString(36).substring(2, 16)}`
    };
    keys.push(key);
    saveMockData('apiKeys', keys);
    return key;
  },
  deleteApiKey: async (id) => {
    let keys = getMockData('apiKeys', INITIAL_API_KEYS);
    keys = keys.filter(k => k.id !== id);
    saveMockData('apiKeys', keys);
    return true;
  },
  getWebhooks: async () => {
    return getMockData('webhooks', INITIAL_WEBHOOKS);
  },
  addWebhook: async (webhook) => {
    const whs = getMockData('webhooks', INITIAL_WEBHOOKS);
    const wh = {
      id: `wh-${whs.length + 1}`,
      status: 'Active',
      lastTriggered: 'Never',
      ...webhook
    };
    whs.push(wh);
    saveMockData('webhooks', whs);
    return wh;
  },
  deleteWebhook: async (id) => {
    let whs = getMockData('webhooks', INITIAL_WEBHOOKS);
    whs = whs.filter(w => w.id !== id);
    saveMockData('webhooks', whs);
    return true;
  },

  // AUDIT LOGS
  getAuditLogs: async () => {
    return getMockData('auditLogs', INITIAL_AUDIT_LOGS);
  },
  addAuditLog: async (log) => {
    const logs = getMockData('auditLogs', INITIAL_AUDIT_LOGS);
    let activeUser = 'Admin';
    try {
      const userStr = localStorage.getItem('nexus_current_user');
      if (userStr) {
        activeUser = JSON.parse(userStr).name;
      }
    } catch (e) {}
    const newLog = {
      id: `log-${logs.length + 1}`,
      timestamp: new Date().toISOString(),
      recruiter: activeUser,
      ip: '192.168.1.45',
      status: 'Success',
      ...log
    };
    logs.unshift(newLog);
    saveMockData('auditLogs', logs);
    return newLog;
  }
};
