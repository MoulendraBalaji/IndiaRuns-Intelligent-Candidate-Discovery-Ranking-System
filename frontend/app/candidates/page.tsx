'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi, API_BASE_URL } from '../api';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  summary: string;
  hard_skills: string[];
  total_years_experience: number;
}

const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice.smith@example.com',
    summary: 'Experienced backend software engineer specializing in high-performance web systems and Python automation. 5 years building with FastAPI, PostgreSQL, and AWS.',
    hard_skills: ['Python', 'FastAPI', 'PostgreSQL', 'AWS', 'Docker', 'Redis'],
    total_years_experience: 5.5
  },
  {
    id: 'c2',
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob.johnson@example.com',
    summary: 'Data Scientist and AI specialist focused on distributed training and transformer models. 4 years developing semantic indexers, vector stores, and custom PyTorch architectures.',
    hard_skills: ['Python', 'PyTorch', 'Qdrant', 'Gemini API', 'LangGraph', 'Docker'],
    total_years_experience: 4.2
  },
  {
    id: 'c3',
    first_name: 'Charlie',
    last_name: 'Brown',
    email: 'charlie@example.com',
    summary: 'Full Stack JavaScript Engineer with minor Python experience. Passionate about beautiful interfaces and state management.',
    hard_skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python'],
    total_years_experience: 3.0
  }
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/candidates');
      if (data && data.length > 0) {
        setCandidates(data);
      } else {
        setCandidates(DEFAULT_CANDIDATES);
      }
    } catch (e) {
      console.warn('Failed to load candidates from API, using default mocks:', e);
      setCandidates(DEFAULT_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError('');
    setUploading(true);
    const file = files[0];
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', 'default_tenant');

    try {
      const response = await fetch(`${API_BASE_URL}/candidates/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const newProfile = await response.json();
      setCandidates((prev) => [newProfile, ...prev]);
      alert('Resume parsed and candidate indexed successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="text-glow-cyan" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-accent-cyan)' }}>
          Candidate Resumes & Profiles
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Upload PDF/DOCX resumes. The Candidate Intelligence Agent parses entities, structures roles, and computes feature metrics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Upload Zone */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '3rem 2rem', textAlign: 'center', border: '2px dashed rgba(0, 201, 224, 0.2)' }}>
          <div style={{ fontSize: '3rem' }}>📁</div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Upload Resume File</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              Select a PDF or DOCX file (up to 10MB)
            </p>
          </div>

          <label className="btn btn-cyan" style={{ alignSelf: 'center', cursor: 'pointer' }}>
            {uploading ? 'Processing resume...' : 'Choose File'}
            <input 
              type="file" 
              accept=".pdf,.docx,.txt" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              disabled={uploading} 
            />
          </label>

          {error && <div style={{ color: 'var(--color-accent-red)', fontSize: '0.85rem' }}>{error}</div>}
        </div>

        {/* Candidate List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Parsed Talent Pool</h2>
          
          {loading ? (
            <div style={{ color: 'var(--color-accent-cyan)' }}>Retrieving profiles...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {candidates.map((c) => (
                <div key={c.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{c.first_name} {c.last_name}</h3>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      Exp: {c.total_years_experience} Years
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                    {c.summary}
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {c.hard_skills.map((skill) => (
                      <span key={skill} className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
