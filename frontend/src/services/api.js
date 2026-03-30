const BASE = '/api';

function getToken() {
  return localStorage.getItem('auth_token') || '';
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const authApi = {
  login: (username, password) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Login failed');
      return data;
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
};

export const api = {
  // Schools
  getSchools: () => request('/schools'),
  getSchool: (id) => request(`/schools/${id}`),
  createSchool: (data) => request('/schools', { method: 'POST', body: data }),
  updateSchool: (id, data) => request(`/schools/${id}`, { method: 'PUT', body: data }),
  deleteSchool: (id) => request(`/schools/${id}`, { method: 'DELETE' }),

  // Offerings / Categories
  getCategories: () => request('/offerings/categories'),
  getOfferings: () => request('/offerings'),
  createOffering: (data) => request('/offerings', { method: 'POST', body: data }),
  createCategory: (data) => request('/offerings/categories', { method: 'POST', body: data }),

  // School Offerings
  getMatrix: () => request('/school-offerings/matrix'),
  getSchoolOfferings: (schoolId) => request(`/school-offerings/school/${schoolId}`),
  updateOffering: (schoolId, offeringId, data) =>
    request(`/school-offerings/school/${schoolId}/offering/${offeringId}`, { method: 'PUT', body: data }),
  bulkUpdateOfferings: (schoolId, offerings) =>
    request(`/school-offerings/school/${schoolId}/bulk`, { method: 'PUT', body: { offerings } }),
  getStats: () => request('/school-offerings/stats'),

  // Retention Detail (grade-wise)
  getRetentionDetail: () => request('/retention-detail'),
  updateRetentionDetail: (id, data) => request(`/retention-detail/${id}`, { method: 'PUT', body: data }),

  // Retention Report
  getRetention: () => request('/retention'),
  createRetention: (data) => request('/retention', { method: 'POST', body: data }),
  updateRetention: (id, data) => request(`/retention/${id}`, { method: 'PUT', body: data }),
  deleteRetention: (id) => request(`/retention/${id}`, { method: 'DELETE' }),

  // Project Progress
  getProgress: () => request('/progress'),
  updateProgress: (id, data) => request(`/progress/${id}`, { method: 'PUT', body: data }),

  // Inventory
  getInventoryCategories: () => request('/inventory/categories'),
  getInventory: (schoolId, category) =>
    request(`/inventory?school_id=${encodeURIComponent(schoolId)}&category=${encodeURIComponent(category)}`),
  saveInventoryRow: (schoolId, templateId, data) =>
    request(`/inventory/school/${schoolId}/item/${templateId}`, { method: 'PUT', body: data }),
  saveInventoryBulk: (schoolId, category, rows) =>
    request(`/inventory/school/${schoolId}/category/${encodeURIComponent(category)}/bulk`, { method: 'PUT', body: { rows } }),

  // BLA
  getBLAGrades: (school) => request(`/bla/grades?school=${encodeURIComponent(school || 'OIS Dindigul')}`),
  getBLA: (grade, school) => request(`/bla/grade/${grade}?school=${encodeURIComponent(school || 'OIS Dindigul')}`),

  // MAU
  getMAU: (school) => request(`/mau${school ? '?school=' + encodeURIComponent(school) : ''}`),
  createMAU: (data) => request('/mau', { method: 'POST', body: data }),
  updateMAU: (id, data) => request(`/mau/${id}`, { method: 'PUT', body: data }),
  deleteMAU: (id) => request(`/mau/${id}`, { method: 'DELETE' }),

  // Monthly Meetings
  getMeetings: () => request('/meetings'),
  createMeeting: (data) => request('/meetings', { method: 'POST', body: data }),
  updateMeeting: (id, data) => request(`/meetings/${id}`, { method: 'PUT', body: data }),
  deleteMeeting: (id) => request(`/meetings/${id}`, { method: 'DELETE' }),

  // User Management
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
