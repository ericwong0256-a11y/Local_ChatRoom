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
  rooms: () => request('/api/rooms', { auth: true }),
  messages: (roomId) => request(`/api/rooms/${roomId}/messages`, { auth: true }),
}

export const BASE_URL = BASE
