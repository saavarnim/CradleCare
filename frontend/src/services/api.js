const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// CORRECTED: Added the 'export' keyword here
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

// --- API Functions ---

export const login = async (phone, password) => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }
  return response.json();
};

export const register = async (phone, password, role) => {
  return await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, role }),
  });
};

export const getCurrentUser = async () => {
  const response = await authenticatedFetch(`/users/me`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
};

export const getInfants = async () => {
    const response = await authenticatedFetch(`/infants`);
    if (!response.ok) throw new Error('Failed to fetch infants');
    return response.json();
};

export const createInfant = async (infantData) => {
    return await authenticatedFetch(`/infants`, {
        method: 'POST',
        body: JSON.stringify(infantData),
    });
};

export const getLogsForInfant = async (infantId) => {
    const response = await authenticatedFetch(`/logs/${infantId}`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
};

export const addLogForInfant = async (infantId, logType) => {
    return await authenticatedFetch(`/logs/${infantId}`, {
        method: 'POST',
        body: JSON.stringify({ type: logType }),
    });
};

export const getGrowthRecords = async (infantId) => {
    const response = await authenticatedFetch(`/infants/${infantId}/growth`);
    if (!response.ok) throw new Error('Failed to fetch growth records');
    return response.json();
};

export const createGrowthRecord = async (infantId, recordData) => {
    return await authenticatedFetch(`/infants/${infantId}/growth`, {
        method: 'POST',
        body: JSON.stringify(recordData),
    });
};

export const getSchemes = async () => {
    const response = await authenticatedFetch(`/schemes`);
    if (!response.ok) throw new Error('Failed to fetch schemes');
    return response.json();
};