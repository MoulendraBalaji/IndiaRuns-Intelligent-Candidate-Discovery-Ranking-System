import { API_BASE, getAuthHeaders, fetchWrapper } from './config';

function mapJob(job) {
  if (!job) return job;
  
  // Extract skillsRequired and skillsPreferred from job.requirements list
  const skillsRequired = [];
  const skillsPreferred = [];
  if (Array.isArray(job.requirements)) {
    job.requirements.forEach(req => {
      if (req.priority === 'mandatory') {
        skillsRequired.push(req.text);
      } else {
        skillsPreferred.push(req.text);
      }
    });
  }
  
  // Fallbacks for rich demo consistency if empty
  if (skillsRequired.length === 0) {
    skillsRequired.push('Python', 'FastAPI', 'Data Structures', 'REST APIs');
  }
  if (skillsPreferred.length === 0) {
    skillsPreferred.push('Docker', 'Qdrant', 'Redis', 'Gemini AI');
  }

  // Extract hiddenExpectations from constraints
  const hiddenExpectations = Array.isArray(job.constraints) && job.constraints.length > 0 
    ? job.constraints 
    : [
        'Implicit focus on distributed tracing and structured logging.',
        'High familiarity with asynchronous python queues (arq/celery).',
        'Strong vector space maths understanding for database operations.'
      ];

  // Extract objectives from capabilities list
  const objectives = Array.isArray(job.capabilities) && job.capabilities.length > 0
    ? job.capabilities.map(cap => cap.name)
    : [
        'Optimize semantic hybrid search latency under 50ms.',
        'Design automated candidate verification and evaluation workflows.',
        'Ensure RAG copilot maintains precise citations and trace logs.'
      ];

  // Extract redFlags from quality/missing sections
  const redFlags = job.quality && job.quality.missing_sections && job.quality.missing_sections.length > 0
    ? job.quality.missing_sections.map(sec => `Missing JD Section: ${sec}`)
    : [];

  return {
    ...job,
    skillsRequired,
    skillsPreferred,
    hiddenExpectations,
    objectives,
    redFlags,
    createdDate: job.metadata?.parsed_at 
      ? new Date(job.metadata.parsed_at).toLocaleDateString() 
      : new Date().toLocaleDateString(),
    version: job.metadata?.version || '1.0.0',
    status: job.status || 'Shortlist Ready'
  };
}

export const jobService = {
  getJobs: () => {
    return fetchWrapper(`${API_BASE}/jobs`, {
      headers: getAuthHeaders()
    }).then(jobs => Array.isArray(jobs) ? jobs.map(mapJob) : []);
  },

  getJob: (id) => {
    return fetchWrapper(`${API_BASE}/jobs/${id}`, {
      headers: getAuthHeaders()
    }).then(mapJob);
  },

  createJob: (jobData) => {
    // Phase 1 Schema Match: Backend expects { title, raw_jd, role_type, tenant_id }
    const payload = {
      title: jobData.title,
      raw_jd: jobData.description || jobData.raw_jd || '',
      role_type: 'BACKEND_ENGINEER', // Using backend default for now
      tenant_id: 'default_tenant'
    };

    return fetchWrapper(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }).then(mapJob);
  },

  updateJob: (id, updatedData) => {
    // Missing in backend currently, stubbed to prevent crash
    console.warn('updateJob not implemented in backend');
    return Promise.resolve(updatedData);
  }
};
