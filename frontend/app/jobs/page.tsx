'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '../api';

interface Job {
  id: string;
  tenant_id: string;
  title: string;
  summary: string;
  mandatory_skills: string[];
  preferred_skills: string[];
  min_years_experience: number;
  role_type?: string;
}

const DEFAULT_JOBS: Job[] = [
  {
    id: 'backend-engineer-dev',
    tenant_id: 'default',
    title: 'Senior Backend Engineer (Python & FastAPI)',
    summary: 'Looking for a Senior Backend Software Engineer with experience in Python, FastAPI, distributed caching, and microservices.',
    mandatory_skills: ['Python', 'FastAPI', 'Redis', 'PostgreSQL'],
    preferred_skills: ['Docker', 'Kubernetes', 'gRPC'],
    min_years_experience: 5.0,
    role_type: 'BACKEND_ENGINEER'
  },
  {
    id: 'data-scientist-dev',
    tenant_id: 'default',
    title: 'Senior AI Engineer & Data Scientist',
    summary: 'Looking for a Senior AI Specialist with background in Gemini API, fine-tuning LLMs, vector search, and RAG pipelines.',
    mandatory_skills: ['Python', 'Gemini API', 'PyTorch', 'Vector Search'],
    preferred_skills: ['Qdrant', 'LangGraph', 'MLOps'],
    min_years_experience: 4.0,
    role_type: 'DATA_SCIENTIST'
  }
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [rawJd, setRawJd] = useState('');
  const [roleType, setRoleType] = useState('BACKEND_ENGINEER');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/jobs');
      if (data && data.length > 0) {
        setJobs(data);
      } else {
        setJobs(DEFAULT_JOBS);
      }
    } catch (e) {
      console.warn('Failed to load jobs from API, using default mocks:', e);
      setJobs(DEFAULT_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.strip || !title || !rawJd) {
      setError('Please provide a title and job description.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const newJob = await fetchApi('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          raw_jd: rawJd,
          role_type: roleType
        })
      });
      setJobs((prev) => [newJob, ...prev]);
      setTitle('');
      setRawJd('');
      alert('Job Position analyzed and added successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create job position.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="text-glow-cyan" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-accent-cyan)' }}>
          Job Positions & Requirements
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Define engineering roles, extract implicit expectations, and perform dynamic evaluation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Jobs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Active Roles</h2>
          
          {loading ? (
            <div style={{ color: 'var(--color-accent-cyan)' }}>Scanning vacancies...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job) => (
                <div key={job.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{job.title}</h3>
                    <span className={`badge ${job.role_type === 'DATA_SCIENTIST' ? 'badge-purple' : 'badge-cyan'}`}>
                      {job.role_type || 'BACKEND_ENGINEER'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                    {job.summary}
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {job.mandatory_skills.map((skill) => (
                      <span key={skill} className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        {skill}
                      </span>
                    ))}
                    <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)' }}>
                      Min Experience: {job.min_years_experience} Yrs
                    </span>
                  </div>

                  <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link href={`/jobs/${job.id}`} className="btn btn-cyan">
                      Run Match Cohort →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Job Form */}
        <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Analyze New Role</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Role Title</label>
              <input 
                type="text" 
                placeholder="e.g. Senior Machine Learning Engineer" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Role Category / Profile Key</label>
              <select value={roleType} onChange={(e) => setRoleType(e.target.value)}>
                <option value="BACKEND_ENGINEER">Backend Software Engineer</option>
                <option value="DATA_SCIENTIST">Data Scientist / AI Engineer</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Raw Job Description</label>
              <textarea 
                rows={8} 
                placeholder="Paste the raw requirements here..." 
                value={rawJd} 
                onChange={(e) => setRawJd(e.target.value)} 
                required 
              />
            </div>

            {error && <div style={{ color: 'var(--color-accent-red)', fontSize: '0.85rem' }}>{error}</div>}

            <button type="submit" className="btn btn-cyan" style={{ marginTop: '0.5rem' }} disabled={submitting}>
              {submitting ? 'Analyzing JD via Agent...' : 'Analyze JD'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
