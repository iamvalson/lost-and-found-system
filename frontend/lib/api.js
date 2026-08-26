let rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085').trim();
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const API_BASE = rawApiUrl.replace(/\/+$/, '');

// ─── Token helpers ────────────────────────────────────────────────────────────
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('laf_token');
}
export function setToken(token) { localStorage.setItem('laf_token', token); }
export function removeToken() { localStorage.removeItem('laf_token'); }

export function getUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('laf_user') || 'null'); } catch { return null; }
}
export function setUser(user) { localStorage.setItem('laf_user', JSON.stringify(user)); }
export function removeUser() { localStorage.removeItem('laf_user'); }

export function logout() { removeToken(); removeUser(); }
export function isLoggedIn() { return !!getToken(); }
export function isAdmin() { return getUser()?.role === 'ADMIN'; }

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) { logout(); window.location.href = '/login'; return; }

  let data;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login:    (body) => request('/api/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  },

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: {
    list: () => request('/api/categories'),
    create: (name) => request('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  },

  // ─── Reports ─────────────────────────────────────────────────────────────────
  reports: {
    create: (body)      => request('/api/reports', { method: 'POST', body: JSON.stringify(body) }),
    get:    (id)        => request(`/api/reports/${id}`),
    mine:   ()          => request('/api/reports/my'),
    matches:(id)        => request(`/api/reports/${id}/matches`),
    search: (params)    => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
      return request(`/api/reports/search?${q.toString()}`);
    },
  },

  // ─── Claims ──────────────────────────────────────────────────────────────────
  claims: {
    submit:         (body) => request('/api/claims',           { method: 'POST', body: JSON.stringify(body) }),
    mine:           ()     => request('/api/claims/my'),
    adminList:      ()     => request('/api/admin/claims'),
    byReport:       (id)   => request(`/api/admin/claims/report/${id}`),
    confirm:        (id)   => request(`/api/admin/claims/${id}/confirm`, { method: 'PUT' }),
    reject:         (id)   => request(`/api/admin/claims/${id}/reject`,  { method: 'PUT' }),
  },

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  dashboard: {
    stats: () => request('/api/admin/dashboard'),
  },
};
