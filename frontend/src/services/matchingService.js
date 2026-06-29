import { API_BASE, getAuthHeaders, fetchWrapper } from './config';

export const matchingService = {
  startMatching: (jobId, limit = 10, k = 100) => {
    return fetchWrapper(`${API_BASE}/jobs/${jobId}/match?limit=${limit}&k=${k}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  getTaskStatus: (taskId) => {
    return fetchWrapper(`${API_BASE}/tasks/${taskId}`, {
      headers: getAuthHeaders()
    });
  },

  getMatchResults: (jobId) => {
    return fetchWrapper(`${API_BASE}/jobs/${jobId}/results`, {
      headers: getAuthHeaders()
    });
  },

  reRank: (jobId, weights) => {
    return fetchWrapper(`${API_BASE}/jobs/${jobId}/re-rank`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ weights })
    });
  },

  exportSubmission: (jobId) => {
    return fetchWrapper(`${API_BASE}/jobs/${jobId}/export?format=csv&top_n=100`, {
      headers: getAuthHeaders()
    });
  }
};
