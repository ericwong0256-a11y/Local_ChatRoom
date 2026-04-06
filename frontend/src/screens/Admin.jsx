import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'

const TABS = [
  { id: 'stats', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'rooms', label: 'Channels' },
  { id: 'messages', label: 'Messages' },
]

export default function Admin({ go }) {
  const [tab, setTab] = useState('stats')
  const me = auth.user()

  return (
    <div className="h-full flex bg-slate-50">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-4 bg-brand-600 text-white">
          <div className="text-lg font-bold">MG_CHAT</div>
          <div className="text-xs text-brand-100">Admin Dashboard</div>
        </div>
        <nav className="flex-1 py-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full text-left px-5 py-3 text-sm ${
                tab === t.id
                  ? 'bg-brand-50 text-brand-600 font-medium border-l-4 border-brand-500'
                  : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4 text-xs text-slate-500">
          <div className="font-medium text-slate-700">{me?.full_name}</div>
          <div className="truncate">{me?.email}</div>
          <button
            onClick={() => go('chat')}
            className="mt-3 w-full text-left text-brand-600 hover:underline"
          >
            ← Back to Chat
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-slate-800">
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
        </header>
        <div className="p-8">
          {tab === 'stats' && <StatsTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'rooms' && <RoomsTab />}
          {tab === 'messages' && <MessagesTab />}
        </div>
      </main>
    </div>
  )
}

/* ---------- Stats ---------- */
function StatsTab() {
  const [data, setData] = useState(null)
  useEffect(() => {
    api.admin.stats().then(setData).catch(() => {})
  }, [])
  if (!data) return <p className="text-slate-500">Loading...</p>

  const cards = [
    { label: 'Total Users', value: data.users },
    { label: 'Admins', value: data.admins },
    { label: 'Channels', value: data.rooms },
    { label: 'Messages', value: data.messages },
  ]
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="text-xs uppercase text-slate-500 font-medium">{c.label}</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800">
          Recent Signups
        </div>
        <ul>
          {data.recentUsers.map((u) => (
            <li
              key={u.id}
              className="px-5 py-3 border-b border-slate-50 last:border-0 flex justify-between text-sm"
            >
              <span className="text-slate-700">
                <span className="font-medium">{u.full_name}</span>{' '}
                <span className="text-slate-400">({u.email})</span>
              </span>
              <span className="text-slate-400">
                {new Date(u.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

/* ---------- Users ---------- */
function UsersTab() {
  const [users, setUsers] = useState([])
  const me = auth.user()
  const load = () => api.admin.users().then(setUsers).catch(() => {})
  useEffect(load, [])

  const toggleAdmin = async (u) => {
    await api.admin.setAdmin(u.id, !u.is_admin)
    load()
  }
  const remove = async (u) => {
    if (!confirm(`Delete user ${u.email}?`)) return
    await api.admin.deleteUser(u.id)
    load()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left px-5 py-3">Name</th>
            <th className="text-left px-5 py-3">Email</th>
            <th className="text-left px-5 py-3">Joined</th>
            <th className="text-left px-5 py-3">Role</th>
            <th className="text-right px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="px-5 py-3 font-medium text-slate-800">{u.full_name}</td>
              <td className="px-5 py-3 text-slate-600">{u.email}</td>
              <td className="px-5 py-3 text-slate-500">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="px-5 py-3">
                {u.is_admin ? (
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                    User
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-right space-x-2">
                <button
                  onClick={() => toggleAdmin(u)}
                  disabled={u.id === me?.id}
                  className="text-brand-600 hover:underline disabled:text-slate-300 disabled:no-underline"
                >
                  {u.is_admin ? 'Demote' : 'Promote'}
                </button>
                <button
                  onClick={() => remove(u)}
                  disabled={u.id === me?.id}
                  className="text-red-500 hover:underline disabled:text-slate-300 disabled:no-underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Rooms ---------- */
function RoomsTab() {
  const [rooms, setRooms] = useState([])
  const [name, setName] = useState('')
  const load = () => api.admin.rooms().then(setRooms).catch(() => {})
  useEffect(load, [])

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await api.admin.createRoom(name.trim())
    setName('')
    load()
  }
  const rename = async (r) => {
    const next = prompt('New name', r.name)
    if (!next?.trim()) return
    await api.admin.renameRoom(r.id, next.trim())
    load()
  }
  const remove = async (r) => {
    if (!confirm(`Delete channel "${r.name}" and all its messages?`)) return
    await api.admin.deleteRoom(r.id)
    load()
  }

  return (
    <>
      <form onSubmit={create} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New channel name"
          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
        >
          Create
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-3">Channel</th>
              <th className="text-left px-5 py-3">Messages</th>
              <th className="text-left px-5 py-3">Created</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-slate-800">{r.name}</td>
                <td className="px-5 py-3 text-slate-600">{r.message_count}</td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right space-x-2">
                  <button onClick={() => rename(r)} className="text-brand-600 hover:underline">
                    Rename
                  </button>
                  <button onClick={() => remove(r)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ---------- Messages ---------- */
function MessagesTab() {
  const [rooms, setRooms] = useState([])
  const [roomId, setRoomId] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    api.admin.rooms().then((r) => {
      setRooms(r)
      if (r[0]) setRoomId(r[0].id)
    })
  }, [])

  const loadMessages = () => {
    if (roomId) api.admin.roomMessages(roomId).then(setMessages)
  }
  useEffect(loadMessages, [roomId])

  const remove = async (m) => {
    if (!confirm('Delete this message?')) return
    await api.admin.deleteMessage(m.id)
    loadMessages()
  }

  return (
    <>
      <div className="mb-4">
        <select
          value={roomId || ''}
          onChange={(e) => setRoomId(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white"
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-3">Author</th>
              <th className="text-left px-5 py-3">Message</th>
              <th className="text-left px-5 py-3">Sent</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="border-t border-slate-100 align-top">
                <td className="px-5 py-3 text-slate-800">
                  <div className="font-medium">{m.author}</div>
                  <div className="text-xs text-slate-400">{m.email}</div>
                </td>
                <td className="px-5 py-3 text-slate-700 max-w-md break-words">{m.body}</td>
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                  {new Date(m.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(m)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  No messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
