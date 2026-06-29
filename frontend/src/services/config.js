export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('nexus_jwt_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const fetchWrapper = async (url, options = {}) => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || errorData.message || 'API Error');
    error.status = response.status;
    
    // Phase 7: Error Handling hooks can be dispatched here (e.g., global toast events)
    if (response.status === 401) {
      console.error('Unauthorized - Redirecting to login');
      // window.location.href = '/login';
    } else if (response.status === 403) {
      console.error('Forbidden');
    } else if (response.status === 404) {
      console.error('Not found');
    } else if (response.status === 422) {
      console.error('Validation error', errorData);
    } else if (response.status === 429) {
      console.error('Too many requests');
    } else if (response.status >= 500) {
      console.error('Server error');
    }
    
    throw error;
  }
  
  // For endpoints that return empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }

  // Handle files/blobs if content-type is not JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.blob();
};
