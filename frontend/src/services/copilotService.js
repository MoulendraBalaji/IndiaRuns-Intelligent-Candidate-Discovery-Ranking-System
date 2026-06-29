import { API_BASE, getAuthHeaders, fetchWrapper } from './config';

export const copilotService = {
  getCopilotHistory: () => {
    console.warn('getCopilotHistory not implemented in backend');
    return Promise.resolve([]);
  },

  askCopilot: (jobId, question, history = []) => {
    // Phase 1 Schema Match: { query, history, job_id, tenant_id }
    return fetchWrapper(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: question,
        history: history,
        job_id: jobId,
        tenant_id: 'default_tenant'
      })
    });
  }
};
