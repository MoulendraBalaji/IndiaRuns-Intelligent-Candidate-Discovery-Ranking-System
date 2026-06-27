export const API_BASE_URL =
  typeof window !== 'undefined'
    ? (window as any).__NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    : 'http://localhost:8000/api/v1';

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `API error ${response.status}`);
  }
  return response.json();
}
