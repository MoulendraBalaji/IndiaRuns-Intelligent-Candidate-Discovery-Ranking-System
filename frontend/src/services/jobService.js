import { API_BASE, getAuthHeaders, fetchWrapper } from './config';

export const jobService = {
  getJobs: () => {
    return fetchWrapper(`${API_BASE}/jobs`, {
      headers: getAuthHeaders()
    });
  },

  getJob: (id) => {
    return fetchWrapper(`${API_BASE}/jobs/${id}`, {
      headers: getAuthHeaders()
    });
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
    });
  },

  updateJob: (id, updatedData) => {
    // Missing in backend currently, stubbed to prevent crash
    console.warn('updateJob not implemented in backend');
    return Promise.resolve(updatedData);
  }
};
