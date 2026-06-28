import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Layout from '../../components/Layout';
import { Bot, Send, User, ChevronRight, RefreshCw } from 'lucide-react';

export default function CopilotChatPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat conversation state
  const [messages, setMessages] = useState([
    { sender: 'copilot', text: "Hello! I am your NEXUS Copilot. Select a role context on the left and ask me any questions about your candidates. For example, you can ask about their experience, specific framework proficiencies, or potential hiring risks." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [streaming, setStreaming] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      const fetchedJobs = await api.getJobs();
      setJobs(fetchedJobs);
      if (fetchedJobs.length > 0) {
        setSelectedJobId(fetchedJobs[0].id);
        const cands = await api.getCandidatesForJob(fetchedJobs[0].id);
        setCandidates(cands);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    // Scroll to bottom of message list on updates
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const handleJobContextChange = async (e) => {
    const id = e.target.value;
    setSelectedJobId(id);
    const cands = await api.getCandidatesForJob(id);
    setCandidates(cands);
    
    // Clear and reset chat
    setMessages([
      { sender: 'copilot', text: `Context switched to ${jobs.find(j => j.id === id)?.title}. Ask me anything about these ${cands.length} candidates.` }
    ]);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Append user message
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setStreaming(true);

    // Call API (simulates latency)
    const reply = await api.askCopilot(selectedJobId, text);
    
    setStreaming(false);
    setMessages(prev => [...prev, reply]);
  };

  const suggestedQuestions = [
    'Who is the best candidate for frontend vanilla CSS?',
    'What are the primary risks for Machine Learning roles?',
    'Show a summary of average candidate scores.',
    'Who has the most years of React experience?'
  ];

  return (
    <Layout pageTitle="Recruiter Copilot">
      <div 
        style={{
          display: 'flex',
          gap: '24px',
          height: 'calc(100vh - 150px)',
          alignItems: 'stretch'
        }}
        className="grid-2"
      >
        {/* Left Side: Context Panel (280px wide) */}
        <div 
          className="card" 
          style={{ 
            width: '280px', 
            flexShrink: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            marginBottom: 0
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Active Context</h3>
            
            <div className="form-group">
              <label className="text-label" htmlFor="copilot-job-context">Evaluate candidates for:</label>
              <select 
                id="copilot-job-context"
                className="input-field" 
                value={selectedJobId}
                onChange={handleJobContextChange}
                disabled={loading}
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <span className="text-muted">Candidates in Context</span>
              <span style={{ fontWeight: 600 }}>{candidates.length} profiles</span>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '20px 0' }}></div>

            <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Suggested Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={streaming}
                  className="chip"
                  style={{
                    textAlign: 'left',
                    fontSize: '12px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--bg-card)',
                    lineHeight: 1.4
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary btn-small btn-full"
              onClick={() => navigate('/copilot/history')}
            >
              View Copilot History
            </button>
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <div 
          className="card" 
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            padding: 0,
            marginBottom: 0,
            overflow: 'hidden'
          }}
        >
          {/* Chat Messages Feed */}
          <div 
            style={{ 
              flex: 1, 
              padding: '24px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px' 
            }}
          >
            {messages.map((msg, idx) => {
              const isCopilot = msg.sender === 'copilot';
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: isCopilot ? 'flex-start' : 'flex-end',
                    gap: '12px',
                    maxWidth: '85%',
                    alignSelf: isCopilot ? 'flex-start' : 'flex-end'
                  }}
                >
                  {isCopilot && (
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-nav-active)',
                        color: 'var(--color-brand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--color-border)',
                        flexShrink: 0
                      }}
                    >
                      <Bot size={16} />
                    </div>
                  )}

                  <div 
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: isCopilot ? 'var(--color-table-header)' : 'var(--bg-card)',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    {msg.text}
                  </div>

                  {!isCopilot && (
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-tag-bg)',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--color-border)',
                        flexShrink: 0
                      }}
                    >
                      <User size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Streaming Indicator */}
            {streaming && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', alignSelf: 'flex-start' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-nav-active)',
                    color: 'var(--color-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <Bot size={16} />
                </div>
                <div 
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#F8F6F3',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '4px'
                  }}
                >
                  <span className="dot" style={{ animation: 'bounce 1s infinite' }}>•</span>
                  <span className="dot" style={{ animation: 'bounce 1s infinite 0.2s' }}>•</span>
                  <span className="dot" style={{ animation: 'bounce 1s infinite 0.4s' }}>•</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input area */}
          <div 
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
              style={{ display: 'flex', gap: '12px' }}
            >
              <input 
                type="text" 
                placeholder="Ask anything about your candidates..." 
                className="input-field" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={streaming}
                style={{ padding: '12px 16px' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={streaming || !inputValue.trim()}
                style={{ padding: '12px 16px' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </Layout>
  );
}
