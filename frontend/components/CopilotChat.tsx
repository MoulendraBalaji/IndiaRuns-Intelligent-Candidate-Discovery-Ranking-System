'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '../app/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CopilotChatProps {
  jobId: string;
  onCandidatesMentioned?: (candidateIds: string[]) => void;
}

export default function CopilotChat({ jobId, onCandidatesMentioned }: CopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your NEXUS Recruiter Copilot. Ask me questions about the candidate rankings, comparative strengths, or skill matches for this position.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_QUERIES = [
    'Why is Candidate #1 ranked above Candidate #2?',
    'Show me candidates with strong FastAPI experience.',
    'Who is closest to the minimum experience requirements?'
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.strip || !text) return;
    
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Create chat payload history
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content
      }));

      // Call API
      const res = await fetchApi('/copilot/chat', {
        method: 'POST',
        body: JSON.stringify({
          query: text,
          history: history,
          job_id: jobId
        })
      });

      const assistantMsg: Message = {
        role: 'assistant',
        content: res.answer
      };

      setMessages((prev) => [...prev, assistantMsg]);
      
      if (res.referenced_candidate_ids && onCandidatesMentioned) {
        onCandidatesMentioned(res.referenced_candidate_ids);
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Error: ${e.message || 'Failed to connect to Copilot Service.'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ height: '550px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      
      {/* Scrollable Message Box */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div 
              key={idx} 
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                lineHeight: '1.5',
                fontSize: '0.9rem',
                backgroundColor: isUser ? 'rgba(243, 156, 18, 0.08)' : 'rgba(0, 201, 224, 0.05)',
                border: `1px solid ${isUser ? 'var(--color-accent-gold)' : 'var(--color-accent-cyan)'}`,
                boxShadow: isUser ? '0 0 10px rgba(243, 156, 18, 0.1)' : '0 0 10px rgba(0, 201, 224, 0.1)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isUser ? 'var(--color-accent-gold)' : 'var(--color-accent-cyan)', marginBottom: '0.25rem' }}>
                {isUser ? 'RECRUITER' : 'NEXUS COPILOT'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {m.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ alignSelf: 'flex-start', fontSize: '0.8rem', color: 'var(--color-accent-cyan)' }}>
            Thinking...
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
        {SUGGESTED_QUERIES.map((q) => (
          <button 
            key={q} 
            onClick={() => sendMessage(q)} 
            disabled={loading}
            className="btn btn-outline" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '9999px', borderStyle: 'dashed' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} 
        style={{ display: 'flex', gap: '0.5rem' }}
      >
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a question about the candidate cohort..." 
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button type="submit" className="btn btn-cyan" disabled={loading || !input.strip}>
          Send
        </button>
      </form>
    </div>
  );
}
