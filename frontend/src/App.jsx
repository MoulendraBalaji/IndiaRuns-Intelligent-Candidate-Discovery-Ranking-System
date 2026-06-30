import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// Pages Imports
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';

import JobsListPage from './pages/jobs/JobsListPage';
import CreateJobPage from './pages/jobs/CreateJobPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import EditJobPage from './pages/jobs/EditJobPage';

import CandidateUploadPage from './pages/candidates/CandidateUploadPage';
import CandidatesListPage from './pages/candidates/CandidatesListPage';
import CandidateDetailPage from './pages/candidates/CandidateDetailPage';
import CandidateComparisonPage from './pages/candidates/CandidateComparisonPage';

import RankedShortlistPage from './pages/shortlists/RankedShortlistPage';
import ShortlistExplainPage from './pages/shortlists/ShortlistExplainPage';
import AdaptiveConfigPage from './pages/shortlists/AdaptiveConfigPage';

import CopilotChatPage from './pages/copilot/CopilotChatPage';
import CopilotHistoryPage from './pages/copilot/CopilotHistoryPage';

import AnalyticsPage from './pages/analytics/AnalyticsPage';
import BiasAuditPage from './pages/analytics/BiasAuditPage';
import AgentPerformancePage from './pages/analytics/AgentPerformancePage';
import ExportCenterPage from './pages/analytics/ExportCenterPage';

import ProfileSettingsPage from './pages/settings/ProfileSettingsPage';
import TeamManagementPage from './pages/settings/TeamManagementPage';
import IntegrationsPage from './pages/settings/IntegrationsPage';
import CompanySettingsPage from './pages/settings/CompanySettingsPage';
import AuditLogsPage from './pages/settings/AuditLogsPage';

// Main Sidebar Layout (for the shortlists index)
import Layout from './components/Layout';
import { api } from './services/api';
import { jobService } from './services/jobService';
import { ListChecks } from 'lucide-react';

// General Shortlists Index Page (shows all jobs where shortlist is ready)
function ShortlistsIndexPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const all = await jobService.getJobs();
      setJobs(all.filter(j => j.status === 'Shortlist Ready'));
      setLoading(false);
    }
    loadData();
  }, []);


  return (
    <Layout pageTitle="Shortlists">
      <div className="flex-between mb-4">
        <h3 style={{ margin: 0 }}>Active Ranked Shortlists</h3>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading shortlist indexes...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <ListChecks size={40} color="var(--color-text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px' }}>No shortlists compiled</h3>
          <p className="text-muted text-small" style={{ margin: '8px 0 20px 0' }}>Upload candidates and analyze a job context to view shortlists here.</p>
          <Link to="/jobs" className="btn btn-primary">Go to Jobs List</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map(job => (
            <div key={job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{job.title}</h4>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '12px' }} className="text-muted">
                  <span>{job.department}</span>
                  <span>•</span>
                  <span>v{job.version} schema</span>
                  <span>•</span>
                  <span>Evaluated blind</span>
                </div>
              </div>
              
              <Link to={`/shortlists/${job.id}`} className="btn btn-primary btn-small">
                View Shortlist
              </Link>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('nexus_jwt_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Dashboard routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Jobs routes */}
        <Route path="/jobs" element={<ProtectedRoute><JobsListPage /></ProtectedRoute>} />
        <Route path="/jobs/create" element={<ProtectedRoute><CreateJobPage /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/edit" element={<ProtectedRoute><EditJobPage /></ProtectedRoute>} />

        {/* Candidates routes */}
        <Route path="/candidates" element={<ProtectedRoute><CandidatesListPage /></ProtectedRoute>} />
        <Route path="/candidates/upload" element={<ProtectedRoute><CandidateUploadPage /></ProtectedRoute>} />
        <Route path="/candidates/:id" element={<ProtectedRoute><CandidateDetailPage /></ProtectedRoute>} />
        <Route path="/candidates/compare" element={<ProtectedRoute><CandidateComparisonPage /></ProtectedRoute>} />

        {/* Shortlists routes */}
        <Route path="/shortlists" element={<ProtectedRoute><ShortlistsIndexPage /></ProtectedRoute>} />
        <Route path="/shortlists/:jobId" element={<ProtectedRoute><RankedShortlistPage /></ProtectedRoute>} />
        <Route path="/shortlists/:jobId/explain/:candidateId" element={<ProtectedRoute><ShortlistExplainPage /></ProtectedRoute>} />
        <Route path="/shortlists/:jobId/config" element={<ProtectedRoute><AdaptiveConfigPage /></ProtectedRoute>} />

        {/* Copilot routes */}
        <Route path="/copilot" element={<ProtectedRoute><CopilotChatPage /></ProtectedRoute>} />
        <Route path="/copilot/history" element={<ProtectedRoute><CopilotHistoryPage /></ProtectedRoute>} />

        {/* Analytics routes */}
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        
        {/* Settings routes */}
        <Route path="/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
        <Route path="/settings/team" element={<ProtectedRoute><TeamManagementPage /></ProtectedRoute>} />
        <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
        <Route path="/settings/company" element={<ProtectedRoute><CompanySettingsPage /></ProtectedRoute>} />
        <Route path="/settings/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
