// NEXUS Centralized API and Local Database Service
// This matches standard REST API endpoints, allowing instant backend integration later.

// Switch this to true when connecting the frontend to your teammate's backend server
const USE_REAL_BACKEND = false; 
const BACKEND_URL = ''; // e.g. 'http://localhost:8000' or blank if proxying through Vite

// Helper to get JWT headers for backend integration
export const getAuthHeaders = () => {
  const token = localStorage.getItem('nexus_jwt_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const LOCAL_STORAGE_KEY = 'nexus_mock_db';

const INITIAL_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    seniority: 'Senior',
    status: 'Shortlist Ready',
    createdDate: '2026-06-15',
    version: '1.0',
    description: 'We are looking for a Senior Frontend Engineer to join our core product team. You will lead the development of our React-based analytics dashboards and interface systems. You must have deep expertise in modern React (v18/v19), vanilla CSS layout techniques, performance profiling, and web optimization. Experience building complex design systems and custom charts is a major plus. You should be comfortable collaborating with designers and product managers to define interface experiences.',
    skillsRequired: ['React', 'JavaScript (ES6+)', 'CSS Grid/Flexbox', 'Web Performance', 'REST APIs', 'Unit Testing'],
    skillsPreferred: ['TypeScript', 'Vite', 'Design Systems', 'Data Visualization (D3/Recharts)', 'Web Accessibility (a19y)'],
    hiddenExpectations: [
      'Must have strong opinions on CSS architecture (prefers structured vanilla CSS over massive utility classes).',
      'Should possess basic UI/UX design sensibilities to fill in gaps without design mocks.',
      'Expected to lead technical RFCs and mentor two junior frontend engineers.'
    ],
    objectives: [
      'Re-architect the analytics dashboard page to improve load speed by 40%.',
      'Establish a unified frontend component library documented in Storybook.',
      'Transition the codebase from webpack to Vite.'
    ],
    interviewQuestions: {
      technical: [
        { id: 't-1', text: 'Explain how you would optimize a slow React dashboard that renders 1,000+ data nodes in a list.', rationale: 'Tests profiling knowledge, virtualization (react-window), and memoization techniques.' },
        { id: 't-2', text: 'Write a custom React hook that throttles state updates and explain how it prevents unnecessary renders.', rationale: 'Evaluates direct React API understanding and performance optimization details.' }
      ],
      behavioral: [
        { id: 'b-1', text: 'Tell me about a time you had a strong disagreement with a UI designer. How did you resolve it?', rationale: 'Measures collaboration style and adherence to frontend design requirements.' }
      ],
      culture: [
        { id: 'c-1', text: 'How do you keep up with the fast-evolving frontend ecosystem without burning out?', rationale: 'Looks at learning mindset and self-directed growth patterns.' }
      ]
    },
    redFlags: [
      'Relies heavily on CSS-in-JS libraries which can bloat compile size; they must show comfort with vanilla styles.',
      'Resume suggests high job-hop rate in the last 2 years.'
    ],
    versions: [
      { version: '1.0', date: '2026-06-15', changes: 'Initial extraction' }
    ]
  },
  {
    id: 'job-2',
    title: 'Staff Machine Learning Engineer',
    department: 'AI Research',
    seniority: 'Staff',
    status: 'Processing',
    createdDate: '2026-06-20',
    version: '1.1',
    description: 'NEXUS is expanding its RAG intelligence pipelines. We are seeking a Staff ML Engineer to own model fine-tuning, vector search optimizations (Qdrant), and custom text processing systems. You will work on enhancing our parsing speeds and ranking algorithms. Solid background in python, PyTorch, HuggingFace, and langchain/llamaindex models is required.',
    skillsRequired: ['Python', 'PyTorch', 'Vector Databases (Qdrant)', 'LLMs & Fine-Tuning', 'Transformers', 'Docker'],
    skillsPreferred: ['FastAPI', 'Kubernetes', 'Hugging Face PEFT', 'CUDA Optimization', 'RAG Evaluations'],
    hiddenExpectations: [
      'Requires low-level CUDA troubleshooting capabilities rather than just API consumption.',
      'Must have published or contributed to open-source LLM benchmarking repos.',
      'Willingness to take pager duties for critical ranking models.'
    ],
    objectives: [
      'Reduce ranking model latency from 8s to under 3s.',
      'Deploy localized fine-tuned Llama-3 8B model into production.',
      'Implement an automated evaluation rig for checking bias mitigation.'
    ],
    interviewQuestions: {
      technical: [
        { id: 't-1', text: 'Compare cosine similarity vs inner product in vector spaces. When would you use which?', rationale: 'Verifies core mathematical intuition behind vector database indexes.' }
      ],
      behavioral: [],
      culture: []
    },
    redFlags: [
      'No evidence of hands-on deployment; mostly academic work.'
    ],
    versions: [
      { version: '1.1', date: '2026-06-22', changes: 'Updated requirements for Qdrant and fine-tuning.' },
      { version: '1.0', date: '2026-06-20', changes: 'Initial setup' }
    ]
  },
  {
    id: 'job-3',
    title: 'Senior Product Designer',
    department: 'Design',
    seniority: 'Senior',
    status: 'Draft',
    createdDate: '2026-06-25',
    version: '1.0',
    description: 'We need an editorial-focused UI/UX Product Designer who can design beautiful, layout-centric applications. We prefer clean typography, structural spacing, and robust grid architectures over heavy drop-shadows and flashy animations. You will own the look and feel of the NEXUS enterprise web tool.',
    skillsRequired: ['Figma', 'Typography Design', 'Grid Systems', 'Prototyping', 'Design System Architecture'],
    skillsPreferred: ['HTML/CSS basics', 'Motion Design', 'User Research', 'Design Audits'],
    hiddenExpectations: [
      'Must be able to code simple prototype mockups in HTML/CSS.',
      'Should love warm editorial colors and crisp layout alignments.'
    ],
    objectives: [
      'Standardize the enterprise design palette and guide all engineers.',
      'Redesign the settings panel to decrease navigation fatigue.'
    ],
    interviewQuestions: {
      technical: [],
      behavioral: [],
      culture: []
    },
    redFlags: [],
    versions: [
      { version: '1.0', date: '2026-06-25', changes: 'Draft created' }
    ]
  }
];

const INITIAL_CANDIDATES = [
  {
    id: 'cand-1',
    name: 'Sarah Jenkins',
    role: 'Senior Frontend Engineer',
    email: 'sarah.j@gmail.com',
    jobId: 'job-1',
    overallScore: 92,
    authenticityScore: 95,
    growthPotential: 'High Potential',
    rank: 1,
    experience: '6 Years',
    location: 'San Francisco, CA',
    noticePeriod: 'Immediate',
    aiSummary: 'Sarah is an exceptional React developer with a strong focus on clean CSS architectures and performance optimization. She has led the migration of a legacy dashboard from Webpack to Vite and has solid experience building re-usable component libraries.',
    skills: {
      core: ['React', 'JavaScript', 'HTML5', 'CSS Grid/Flexbox', 'Web Performance'],
      frameworks: ['Vite', 'Redux', 'Next.js', 'Jest'],
      soft: ['Technical Leadership', 'Mentorship', 'Collaboration']
    },
    projects: [
      { name: 'Core Admin Dashboard', description: 'Rebuilt administration interface for standard retail customers, improving FCP from 2.4s to 1.1s.', tech: ['React', 'Vite', 'Vanilla CSS', 'Jest'], impact: 'Sped up dashboard loading by 54% and reduced rendering issues.' },
      { name: 'Design Tokens Compiler', description: 'Built an internal package that reads Figma tokens and outputs CSS variable rules.', tech: ['Node.js', 'Figma API', 'Sass'], impact: 'Adopted by 4 independent project teams.' }
    ],
    timeline: [
      { role: 'Senior Frontend Engineer', company: 'WebFlow Corp', duration: '2023 - Present' },
      { role: 'Software Engineer II', company: 'SaaSify Inc', duration: '2020 - 2023' }
    ],
    hiringRisks: [],
    status: 'Shortlisted'
  },
  {
    id: 'cand-2',
    name: 'Michael Chang',
    role: 'Senior React Specialist',
    email: 'm.chang@outlook.com',
    jobId: 'job-1',
    overallScore: 85,
    authenticityScore: 89,
    growthPotential: 'Moderate',
    rank: 2,
    experience: '8 Years',
    location: 'Remote, US',
    noticePeriod: '30 Days',
    aiSummary: 'Michael is a seasoned engineer with deep experience in responsive layouts. He excels in building accessible UI elements but has slightly less experience with raw performance profiling metrics.',
    skills: {
      core: ['React', 'JavaScript', 'CSS Flexbox', 'Accessibility (WCAG)', 'REST APIs'],
      frameworks: ['Webpack', 'Redux', 'Tailwind', 'Storybook'],
      soft: ['Self-direction', 'Communication']
    },
    projects: [
      { name: 'Accessible Portal', description: 'Created an audit and refit of a patient scheduling tool to conform to WCAG 2.1 AA standards.', tech: ['React', 'Sass', 'Axe-core'], impact: 'Ensured compliance, preventing potential regulatory penalties.' }
    ],
    timeline: [
      { role: 'Lead UI Developer', company: 'HealthLink', duration: '2021 - Present' },
      { role: 'Frontend Engineer', company: 'Initech Systems', duration: '2018 - 2021' }
    ],
    hiringRisks: [
      { title: 'Webpack Reliance', description: 'Prefers Webpack configurations over Vite or ESBuild; might require learning curve for Vite-based stack.', severity: 'Low' }
    ],
    status: 'Ranked'
  },
  {
    id: 'cand-3',
    name: 'Elena Rostova',
    role: 'Staff ML Scientist',
    email: 'elena.rostova@ai.io',
    jobId: 'job-2',
    overallScore: 94,
    authenticityScore: 98,
    growthPotential: 'High Potential',
    rank: 1,
    experience: '9 Years',
    location: 'Boston, MA',
    noticePeriod: '60 Days',
    aiSummary: 'Elena is a prominent researcher and engineer specializing in vector search indices. She has published papers on transformer speed-ups and has built core retrieval algorithms for search companies.',
    skills: {
      core: ['Python', 'PyTorch', 'Vector Search', 'Transformers', 'CUDA'],
      frameworks: ['Qdrant', 'FastAPI', 'HuggingFace', 'Docker'],
      soft: ['System Architecture', 'Academic Writing']
    },
    projects: [
      { name: 'Vector Index Tuner', description: 'Developed custom indexing pipeline reducing vector quantization errors in large search clusters.', tech: ['Python', 'Qdrant', 'C++'], impact: 'Decreased semantic search miss-rate by 15%.' }
    ],
    timeline: [
      { role: 'Staff Scientist', company: 'Neural Systems Lab', duration: '2022 - Present' },
      { role: 'Senior ML Engineer', company: 'DeepCognition Inc', duration: '2017 - 2022' }
    ],
    hiringRisks: [],
    status: 'Shortlisted'
  },
  {
    id: 'cand-4',
    name: 'David Kojo',
    role: 'NLP Developer',
    email: 'd.kojo@yahoo.com',
    jobId: 'job-2',
    overallScore: 71,
    authenticityScore: 40,
    growthPotential: 'Moderate',
    rank: 2,
    experience: '4 Years',
    location: 'Seattle, WA',
    noticePeriod: '30 Days',
    aiSummary: 'David has solid Python foundational knowledge but his resume contains several generic templates and lacks deep evidence of fine-tuning models. Authenticity check detected anomalous skill declarations.',
    skills: {
      core: ['Python', 'Docker', 'REST APIs', 'SQL'],
      frameworks: ['Flask', 'TensorFlow', 'scikit-learn'],
      soft: ['Teamwork']
    },
    projects: [
      { name: 'Text Classifier', description: 'Built basic web app using flask to classify customer feedback emails into 4 categories.', tech: ['Python', 'Flask', 'scikit-learn'], impact: 'Automated 20% of email routing.' }
    ],
    timeline: [
      { role: 'ML Engineer', company: 'Solutions Corp', duration: '2022 - Present' }
    ],
    hiringRisks: [
      { title: 'PII / Verification Discrepancy', description: 'Resume asserts lead architect roles that are inconsistent with career tenure (4 years).', severity: 'High' },
      { title: 'Lack of Vector DB experience', description: 'Has no experience with Qdrant, Milvus or Pinecone.', severity: 'Medium' }
    ],
    status: 'Pending'
  }
];

const INITIAL_NOTIFICATIONS = [
  { id: 'notif-1', title: 'Shortlist Ready', description: 'AI Shortlist ranking is ready for Senior Frontend Engineer.', type: 'shortlist', timestamp: '10m ago', unread: true },
  { id: 'notif-2', title: 'Processing Resumes', description: 'Parsed and indexed 15 resumes for Staff Machine Learning Engineer.', type: 'processing', timestamp: '2h ago', unread: true },
  { id: 'notif-3', title: 'System Maintenance', description: 'PII-anonymization services will be updated tonight at 11 PM EST.', type: 'system', timestamp: '1d ago', unread: false }
];

const INITIAL_COPILOT_CONVERSATIONS = [
  { id: 'chat-1', title: 'Front-end CSS Layout capabilities', jobId: 'job-1', timestamp: '2h ago', messageCount: 5, messages: [
    { sender: 'user', text: 'Who is the best candidate for frontend with strong vanilla CSS skills?' },
    { sender: 'copilot', text: 'Sarah Jenkins is ranked #1. Her profile shows extensive work in vanilla CSS Layouts (Grid/Flexbox) and she even built an internal Figma-to-CSS variable tokens compiler.' }
  ]},
  { id: 'chat-2', title: 'Verification anomalies on ML candidates', jobId: 'job-2', timestamp: '3d ago', messageCount: 2, messages: [
    { sender: 'user', text: 'Are there any candidate warning flags for the ML role?' },
    { sender: 'copilot', text: 'Yes, David Kojo (NLP Developer) has a high-risk flag. His resume states he was the Lead Architect on complex systems, which does not align with his 4-year total career tenure.' }
  ]}
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

// Initialize database in localStorage
function getDb() {
  const db = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!db) {
    const defaultDb = {
      jobs: INITIAL_JOBS,
      candidates: INITIAL_CANDIDATES,
      notifications: INITIAL_NOTIFICATIONS,
      copilotHistory: INITIAL_COPILOT_CONVERSATIONS,
      team: INITIAL_TEAM,
      apiKeys: INITIAL_API_KEYS,
      webhooks: INITIAL_WEBHOOKS,
      auditLogs: INITIAL_AUDIT_LOGS,
      onboarding: { step: 1, companyName: '', industry: '', size: '', website: '' }
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultDb));
    return defaultDb;
  }
  return JSON.parse(db);
}

function saveDb(db) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
}

// Simulates API lag
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // AUTH API
  login: async (email, password) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Authentication failed');
      const data = await response.json();
      localStorage.setItem('nexus_jwt_token', data.token);
      return data;
    } else {
      await delay();
      const mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEiLCJlbWFpbCI6ImxvZ2luQG5leHVzLmFpIn0.sig";
      localStorage.setItem('nexus_jwt_token', mockJwt);
      return { token: mockJwt, user: { name: 'John Doe', email } };
    }
  },

  onboardWorkspace: async (token, onboardingData) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/auth/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...onboardingData })
      });
      if (!response.ok) throw new Error('Onboarding failed');
      const data = await response.json();
      localStorage.setItem('nexus_jwt_token', data.token);
      return data;
    } else {
      await delay();
      const mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEiLCJlbWFpbCI6ImxvZ2luQG5leHVzLmFpIn0.sig";
      localStorage.setItem('nexus_jwt_token', mockJwt);
      return { token: mockJwt };
    }
  },

  // JOBS API
  getJobs: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/jobs`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return await response.json();
    } else {
      await delay();
      return getDb().jobs;
    }
  },
  getJob: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch job');
      return await response.json();
    } else {
      await delay();
      return getDb().jobs.find(j => j.id === id);
    }
  },
  createJob: async (jobData) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/jobs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData)
      });
      if (!response.ok) throw new Error('Failed to create job');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      const newJob = {
        id: `job-${db.jobs.length + 1}`,
        createdDate: new Date().toISOString().split('T')[0],
        version: '1.0',
        status: 'Draft',
        skillsRequired: jobData.skillsRequired || [],
        skillsPreferred: jobData.skillsPreferred || [],
        hiddenExpectations: [
          'Implicit understanding of company scaling parameters.',
          'Requires strong cross-functional design collaboration.'
        ],
        objectives: ['Implement next phase of infrastructure goals.'],
        interviewQuestions: { technical: [], behavioral: [], culture: [] },
        redFlags: [],
        versions: [{ version: '1.0', date: new Date().toISOString().split('T')[0], changes: 'Initial extraction' }],
        ...jobData
      };
      db.jobs.unshift(newJob);
      saveDb(db);
      return newJob;
    }
  },
  updateJob: async (id, updatedData) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) throw new Error('Failed to update job');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      const idx = db.jobs.findIndex(j => j.id === id);
      if (idx !== -1) {
        const current = db.jobs[idx];
        const nextVersion = (parseFloat(current.version) + 0.1).toFixed(1);
        const updated = {
          ...current,
          ...updatedData,
          version: nextVersion.toString(),
          versions: [
            { version: nextVersion.toString(), date: new Date().toISOString().split('T')[0], changes: 'Modified parameters and re-analyzed.' },
            ...current.versions
          ]
        };
        db.jobs[idx] = updated;
        saveDb(db);
        return updated;
      }
      return null;
    }
  },

  // CANDIDATES API
  getCandidates: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/candidates`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch candidates');
      return await response.json();
    } else {
      await delay();
      return getDb().candidates;
    }
  },
  getCandidate: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/candidates/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch candidate');
      return await response.json();
    } else {
      await delay();
      return getDb().candidates.find(c => c.id === id);
    }
  },
  getCandidatesForJob: async (jobId) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/candidates`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch candidates for job');
      return await response.json();
    } else {
      await delay();
      return getDb().candidates.filter(c => c.jobId === jobId);
    }
  },
  addCandidate: async (candidate) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/candidates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(candidate)
      });
      if (!response.ok) throw new Error('Failed to add candidate');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      const newCand = {
        id: `cand-${db.candidates.length + 1}`,
        overallScore: Math.floor(Math.random() * 40) + 60,
        authenticityScore: Math.floor(Math.random() * 30) + 70,
        growthPotential: Math.random() > 0.5 ? 'High Potential' : 'Moderate',
        projects: [],
        timeline: [],
        hiringRisks: [],
        ...candidate
      };
      db.candidates.push(newCand);
      saveDb(db);
      return newCand;
    }
  },
  updateCandidateStatus: async (id, status) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/candidates/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update candidate status');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      const cand = db.candidates.find(c => c.id === id);
      if (cand) {
        cand.status = status;
        saveDb(db);
      }
      return cand;
    }
  },

  // NOTIFICATIONS
  getNotifications: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/notifications`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } else {
      await delay();
      return getDb().notifications;
    }
  },
  markAllNotificationsRead: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to update notifications');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      db.notifications.forEach(n => n.unread = false);
      saveDb(db);
      return db.notifications;
    }
  },

  // COPILOT
  getCopilotHistory: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/copilot/history`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch copilot history');
      return await response.json();
    } else {
      await delay();
      return getDb().copilotHistory;
    }
  },
  askCopilot: async (jobId, question) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/copilot/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jobId, question })
      });
      if (!response.ok) throw new Error('Failed to get copilot reply');
      return await response.json();
    } else {
      await delay(600); 
      const db = getDb();
      let text = "I've analyzed the candidates for this role. Based on the evidence in their resumes, Sarah Jenkins is the strongest fit for React tasks, while Elena Rostova excels in Python and AI model deployment.";
      if (question.toLowerCase().includes('risk') || question.toLowerCase().includes('flag')) {
        text = "David Kojo has a high risk flag due to PII/verification anomalies. His stated role durations are inconsistent with overall career records.";
      } else if (question.toLowerCase().includes('score')) {
        text = "Overall average candidate scores are 83.5/100, which is higher than normal. Sarah Jenkins leads with 92/100.";
      }

      const nextMessage = { sender: 'copilot', text };
      const chatIdx = db.copilotHistory.findIndex(c => c.jobId === jobId);
      if (chatIdx !== -1) {
        db.copilotHistory[chatIdx].messages.push({ sender: 'user', text: question });
        db.copilotHistory[chatIdx].messages.push(nextMessage);
        db.copilotHistory[chatIdx].messageCount = db.copilotHistory[chatIdx].messages.length;
        db.copilotHistory[chatIdx].timestamp = 'Just now';
      } else {
        db.copilotHistory.unshift({
          id: `chat-${db.copilotHistory.length + 1}`,
          title: question.substring(0, 30) + '...',
          jobId,
          timestamp: 'Just now',
          messageCount: 2,
          messages: [
            { sender: 'user', text: question },
            nextMessage
          ]
        });
      }
      saveDb(db);
      return nextMessage;
    }
  },

  // TEAM MANAGEMENT
  getTeam: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/team`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch team members');
      return await response.json();
    } else {
      await delay();
      return getDb().team;
    }
  },
  inviteTeamMember: async (member) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/team/invite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(member)
      });
      if (!response.ok) throw new Error('Failed to invite member');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      const newMember = {
        id: `team-${db.team.length + 1}`,
        status: 'Invited',
        lastActive: 'Never',
        ...member
      };
      db.team.push(newMember);
      saveDb(db);
      return newMember;
    }
  },
  removeTeamMember: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/team/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to remove team member');
      return true;
    } else {
      await delay();
      const db = getDb();
      db.team = db.team.filter(m => m.id !== id);
      saveDb(db);
      return true;
    }
  },
  updateTeamMemberRole: async (id, role) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/team/${id}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role })
      });
      if (!response.ok) throw new Error('Failed to update role');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      const m = db.team.find(t => t.id === id);
      if (m) {
        m.role = role;
        saveDb(db);
      }
      return m;
    }
  },

  // API KEYS & WEBHOOKS
  getApiKeys: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/keys`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch keys');
      return await response.json();
    } else {
      await delay();
      return getDb().apiKeys;
    }
  },
  generateApiKey: async (name) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/keys`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error('Failed to generate key');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      const key = {
        id: `key-${db.apiKeys.length + 1}`,
        name,
        created: new Date().toISOString().split('T')[0],
        lastUsed: 'Never',
        status: 'Active',
        value: `sk_live_${Math.random().toString(36).substring(2, 16)}`
      };
      db.apiKeys.push(key);
      saveDb(db);
      return key;
    }
  },
  deleteApiKey: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/keys/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete key');
      return true;
    } else {
      await delay();
      const db = getDb();
      db.apiKeys = db.apiKeys.filter(k => k.id !== id);
      saveDb(db);
      return true;
    }
  },
  getWebhooks: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/webhooks`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      return await response.json();
    } else {
      await delay();
      return getDb().webhooks;
    }
  },
  addWebhook: async (webhook) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/webhooks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(webhook)
      });
      if (!response.ok) throw new Error('Failed to create webhook');
      return await response.json();
    } else {
      await delay();
      const db = getDb();
      const wh = {
        id: `wh-${db.webhooks.length + 1}`,
        status: 'Active',
        lastTriggered: 'Never',
        ...webhook
      };
      db.webhooks.push(wh);
      saveDb(db);
      return wh;
    }
  },
  deleteWebhook: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/webhooks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete webhook');
      return true;
    } else {
      await delay();
      const db = getDb();
      db.webhooks = db.webhooks.filter(w => w.id !== id);
      saveDb(db);
      return true;
    }
  },

  // AUDIT LOGS
  getAuditLogs: async () => {
    if (USE_REAL_BACKEND) {
      const response = await fetch(`${BACKEND_URL}/api/settings/audit-logs`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch logs');
      return await response.json();
    } else {
      await delay();
      return getDb().auditLogs;
    }
  },
  addAuditLog: async (log) => {
    if (USE_REAL_BACKEND) {
      await fetch(`${BACKEND_URL}/api/settings/audit-logs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(log)
      });
    } else {
      const db = getDb();
      const newLog = {
        id: `log-${db.auditLogs.length + 1}`,
        timestamp: new Date().toISOString(),
        recruiter: 'John Doe',
        ip: '192.168.1.45',
        status: 'Success',
        ...log
      };
      db.auditLogs.unshift(newLog);
      saveDb(db);
    }
  }
};
