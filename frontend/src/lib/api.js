const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function token() {
  return localStorage.getItem('mgchat_token')
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) headers.Authorization = `Bearer ${token()}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload }),
  signin: (payload) => request('/api/auth/signin', { method: 'POST', body: payload }),
  forgot: (email) => request('/api/auth/forgot', { method: 'POST', body: { email } }),
  reset: (token, password) =>
    request('/api/auth/reset', { method: 'POST', body: { token, password } }),
  me: () => request('/api/me', { auth: true }),
  updateMe: (payload) => request('/api/me', { method: 'PATCH', body: payload, auth: true }),
  rooms: () => request('/api/rooms', { auth: true }),
  contacts: () => request('/api/contacts', { auth: true }),
  messages: (roomId) => request(`/api/rooms/${roomId}/messages`, { auth: true }),
  members: (roomId) => request(`/api/rooms/${roomId}/members`, { auth: true }),
  createRoom: (name, member_ids) =>
    request('/api/rooms', { method: 'POST', body: { name, member_ids }, auth: true }),
  deleteRoom: (id) => request(`/api/rooms/${id}`, { method: 'DELETE', auth: true }),

  admin: {
    stats: () => request('/api/admin/stats', { auth: true }),
    users: () => request('/api/admin/users', { auth: true }),
    setAdmin: (id, is_admin) =>
      request(`/api/admin/users/${id}`, { method: 'PATCH', body: { is_admin }, auth: true }),
    deleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE', auth: true }),
    rooms: () => request('/api/admin/rooms', { auth: true }),
    createRoom: (name) =>
      request('/api/admin/rooms', { method: 'POST', body: { name }, auth: true }),
    renameRoom: (id, name) =>
      request(`/api/admin/rooms/${id}`, { method: 'PATCH', body: { name }, auth: true }),
    deleteRoom: (id) => request(`/api/admin/rooms/${id}`, { method: 'DELETE', auth: true }),
    roomMessages: (id) => request(`/api/admin/rooms/${id}/messages`, { auth: true }),
    deleteMessage: (id) => request(`/api/admin/messages/${id}`, { method: 'DELETE', auth: true }),
  },
}

export const BASE_URL = BASE
