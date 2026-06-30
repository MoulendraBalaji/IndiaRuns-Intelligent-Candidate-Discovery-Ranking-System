import { API_BASE, getAuthHeaders, fetchWrapper } from './config';
import { matchingService } from './matchingService';

function mapCandidate(c) {
  if (!c) return c;
  return {
    ...c,
    // Ensure 'name' is defined (backend has first_name and last_name)
    name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Candidate',
    // Ensure 'role' is defined
    role: c.role || c.experience?.[0]?.title || c.summary || 'Software Engineer',
    // Ensure 'skills' matches the expected core/soft format
    skills: c.skills && c.skills.core ? c.skills : {
      core: c.hard_skills || [],
      soft: c.soft_skills || []
    },
    // Ensure other UI properties are present
    overallScore: c.overallScore || (c.score ? Math.round(c.score * 100) : 85),
    authenticityScore: c.authenticityScore || 90,
    experience: c.experience_years ? `${c.experience_years} years` : `${c.total_years_experience || 0} years`,
    status: c.status || 'Shortlisted'
  };
}

export const candidateService = {
  getCandidates: () => {
    return fetchWrapper(`${API_BASE}/candidates`, {
      headers: getAuthHeaders()
    }).then(cands => Array.isArray(cands) ? cands.map(mapCandidate) : []);
  },

  getCandidate: (id) => {
    return fetchWrapper(`${API_BASE}/candidates/${id}`, {
      headers: getAuthHeaders()
    }).then(mapCandidate);
  },

  getCandidatesForJob: async (jobId) => {
    try {
      const matchResults = await matchingService.getMatchResults(jobId);
      if (!matchResults || !matchResults.ranking_result || !matchResults.ranking_result.rankings) {
        return [];
      }
      
      const rankings = matchResults.ranking_result.rankings;
      const candidates = [];
      for (const rank of rankings) {
        try {
          const profile = await candidateService.getCandidate(rank.candidate_id);
          if (profile) {
            candidates.push({
              ...profile,
              overallScore: Math.round(rank.final_score * 100),
              status: rank.passed_gates ? 'Shortlisted' : 'Rejected',
              rank_position: rank.rank_position
            });
          }
        } catch (e) {
          console.error(`Failed to load profile for candidate ${rank.candidate_id}:`, e);
        }
      }
      // Sort by overallScore descending to align with UI expectations
      candidates.sort((a, b) => b.overallScore - a.overallScore);
      return candidates;
    } catch (e) {
      console.error("Failed to get candidates for job from backend results:", e);
      // Fallback: list all and filter client side
      return fetchWrapper(`${API_BASE}/candidates`, {
        headers: getAuthHeaders()
      }).then(cands => 
        (Array.isArray(cands) ? cands.map(mapCandidate) : [])
          .filter(c => c.jobId === jobId || c.job_id === jobId)
      );
    }
  },

  addCandidate: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', 'default_tenant');

    const headers = getAuthHeaders();
    delete headers['Content-Type']; // Let browser set boundary

    return fetchWrapper(`${API_BASE}/candidates/upload`, {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(mapCandidate);
  },

  updateCandidateStatus: (id, status) => {
    console.warn('updateCandidateStatus not implemented in backend');
    return Promise.resolve({ id, status });
  }
};
