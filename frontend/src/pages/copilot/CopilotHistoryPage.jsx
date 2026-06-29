import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { copilotService } from '../../services/copilotService';
import { jobService } from '../../services/jobService';
import Layout from '../../components/Layout';
import { Search, Plus, MessageSquare, Trash2, ArrowLeft } from 'lucide-react';

export default function CopilotHistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      const fetchedHistory = await copilotService.getCopilotHistory();
      const fetchedJobs = await jobService.getJobs();
      setHistory(fetchedHistory);
      setJobs(fetchedJobs);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDeleteHistory = async (id) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        const db = JSON.parse(localStorage.getItem('nexus_mock_db') || '{}');
        db.copilotHistory = db.copilotHistory.filter(h => h.id !== id);
        localStorage.setItem('nexus_mock_db', JSON.stringify(db));
        setHistory(db.copilotHistory);
      } catch (e) {}
    }
  };

  const getFilteredHistory = () => {
    return history.filter(h => 
      h.title.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filtered = getFilteredHistory();

  return (
    <Layout pageTitle="Copilot History">
      {/* Header and actions */}
      <div className="flex-between mb-4">
        <Link 
          to="/copilot" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Chat</span>
        </Link>

        <button className="btn btn-primary" onClick={() => navigate('/copilot')}>
          <Plus size={16} />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search 
          size={18} 
          color="var(--color-text-secondary)" 
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input 
          type="text" 
          placeholder="Search past conversations..." 
          className="input-field" 
          style={{ paddingLeft: '38px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <span className="text-muted">Loading history...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
          <MessageSquare size={40} color="var(--color-text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No past conversations</h3>
          <p className="text-muted text-small" style={{ margin: '8px 0 20px 0' }}>Ask questions in the Copilot Chat room to see logs compiled here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/copilot')}>
            Start First Chat
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map((item) => {
            const jobTitle = jobs.find(j => j.id === item.jobId)?.title || 'General Context';
            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <MessageSquare size={20} color="var(--color-text-secondary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                      <span className="chip" style={{ fontSize: '10px', padding: '2px 6px' }}>{jobTitle}</span>
                      <span className="text-muted text-small">{item.timestamp}</span>
                      <span className="text-muted text-small">•</span>
                      <span className="text-muted text-small">{item.messageCount} messages</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => navigate('/copilot', { state: { resumeChatId: item.id } })}
                  >
                    Resume
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteHistory(item.id)}
                    style={{ border: 'none', background: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px' }}
                    title="Delete Conversation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
