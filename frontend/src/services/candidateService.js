import { API_BASE, getAuthHeaders, fetchWrapper } from './config';

export const candidateService = {
  getCandidates: () => {
    return fetchWrapper(`${API_BASE}/candidates`, {
      headers: getAuthHeaders()
    });
  },

  getCandidate: (id) => {
    return fetchWrapper(`${API_BASE}/candidates/${id}`, {
      headers: getAuthHeaders()
    });
  },

  getCandidatesForJob: (jobId) => {
    // Missing in backend, so we fetch all and filter client-side for now
    return fetchWrapper(`${API_BASE}/candidates`, {
      headers: getAuthHeaders()
    }).then(cands => cands.filter(c => c.jobId === jobId || c.job_id === jobId));
  },

  addCandidate: (file) => {
    // Phase 1 Schema Match: Backend expects multipart/form-data with `file` and `tenant_id`
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', 'default_tenant');

    const headers = getAuthHeaders();
    delete headers['Content-Type']; // Let browser set boundary

    return fetchWrapper(`${API_BASE}/candidates/upload`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
  },

  updateCandidateStatus: (id, status) => {
    console.warn('updateCandidateStatus not implemented in backend');
    return Promise.resolve({ id, status });
  }
};
