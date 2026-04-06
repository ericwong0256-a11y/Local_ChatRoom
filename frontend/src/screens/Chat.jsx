import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'
import { getSocket } from '../lib/socket.js'

const TABS = [
  { id: 'chats', label: 'Chats' },
  { id: 'contacts', label: 'Contacts' },
]

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat({ go }) {
  const me = auth.user()
  const [tab, setTab] = useState('chats')
  const [rooms, setRooms] = useState([])
  const [contacts, setContacts] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const scrollRef = useRef(null)

  // Load contacts (used by both contacts tab and create-channel modal)
  useEffect(() => {
    api.contacts().then(setContacts).catch(() => {})
  }, [])

  const loadRooms = (selectId) => {
    api
      .rooms()
      .then((r) => {
        setRooms(r)
        if (selectId) setActiveRoom(selectId)
        else if (!activeRoom && r[0]) setActiveRoom(r[0].id)
      })
      .catch((err) => {
        if (err.message === 'Unauthorized') go('signin')
      })
  }

  // Load rooms once
  useEffect(() => {
    loadRooms()
  }, [])

  // Load messages + join room + listen for new messages
  useEffect(() => {
    if (!activeRoom) return
    const socket = getSocket()

    api.messages(activeRoom).then(setMessages).catch(() => {})
    socket.emit('room:join', activeRoom)

    const onNew = (msg) => {
      if (msg.room_id === activeRoom) {
        setMessages((m) => [...m, msg])
      }
    }
    socket.on('message:new', onNew)
    return () => socket.off('message:new', onNew)
  }, [activeRoom])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    if (!draft.trim() || !activeRoom) return
    getSocket().emit('message:send', { roomId: activeRoom, body: draft.trim() })
    setDraft('')
  }

  const activeRoomObj = rooms.find((r) => r.id === activeRoom)

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <aside className="w-[320px] flex flex-col border-r border-slate-200 bg-white">
        <div className="bg-brand-600 px-5 py-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-600" fill="currentColor">
              <path d="M21.5 2.5L2 11l6 2.2L18 5.5 10 14l8.5 7.5L21.5 2.5z" />
            </svg>
          </div>
          <span className="text-white text-xl font-bold">MG_CHAT</span>
        </div>

        <div className="flex border-b border-slate-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-medium ${
                tab === t.id
                  ? 'text-brand-600 border-b-2 border-brand-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'chats' && (
          <button
            onClick={() => setShowCreate(true)}
            className="mx-4 mt-3 px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
          >
            + New Private Channel
          </button>
        )}

        <div className="px-4 py-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'chats' &&
            rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRoom(r.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 ${
                  activeRoom === r.id
                    ? 'bg-brand-50 border-brand-500'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-lg">
                  {r.is_private ? '🔒' : '👥'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
                    {r.name}
                    {r.is_private ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        private
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-slate-500 truncate">Tap to open</div>
                </div>
              </button>
            ))}

          {tab === 'contacts' && (
            <>
              {contacts.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">No contacts yet.</p>
              )}
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-l-4 border-transparent"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-base font-semibold text-brand-600">
                    {c.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
                      {c.full_name}
                      {c.is_admin ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                          admin
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{c.email}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-700 truncate">{me?.full_name}</div>
            {me?.is_admin && (
              <button
                onClick={() => go('admin')}
                className="text-xs px-2 py-1 rounded bg-brand-100 text-brand-700 font-medium hover:bg-brand-200"
              >
                Admin
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => go('settings')}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
            >
              ⚙️ Settings
            </button>
            <button
              onClick={() => {
                if (confirm('Sign out?')) go('signin')
              }}
              className="flex-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 font-medium"
            >
              ⎋ Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col chat-bg">
        <header className="bg-brand-600 px-6 py-3 flex items-center gap-4 text-white">
          <button className="text-xl">←</button>
          <div className="flex-1">
            <div className="font-semibold text-lg leading-tight">
              {activeRoomObj?.name || 'Select a room'}
            </div>
            <div className="text-xs text-brand-100">live</div>
          </div>
          <button className="text-xl">🔍</button>
          <button className="text-xl">📞</button>
          {activeRoomObj?.is_private && activeRoomObj?.owner_id === me?.id && (
            <button
              title="Delete channel"
              onClick={async () => {
                if (!confirm(`Delete channel "${activeRoomObj.name}"? This cannot be undone.`)) return
                try {
                  await api.deleteRoom(activeRoomObj.id)
                  setActiveRoom(null)
                  setMessages([])
                  loadRooms()
                } catch (err) {
                  alert(err.message)
                }
              }}
              className="text-xl hover:text-red-200"
            >
              🗑
            </button>
          )}
          <button className="text-xl">⋯</button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {messages.map((m) => {
            const self = m.user_id === me?.id
            return (
              <div key={m.id} className={`flex items-start gap-3 ${self ? 'justify-end' : ''}`}>
                {!self && (
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-600">
                    {m.author?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className={`max-w-md ${self ? 'text-right' : ''}`}>
                  {!self && (
                    <div className="text-sm font-semibold text-brand-600 mb-1">{m.author}</div>
                  )}
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      self
                        ? 'bg-brand-500 text-white rounded-br-sm'
                        : 'bg-white text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    {m.body}
                    <span className={`ml-2 text-[10px] ${self ? 'text-brand-100' : 'text-slate-400'}`}>
                      {fmtTime(m.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <form onSubmit={send} className="px-6 py-4 flex items-center gap-3">
          <button type="button" className="text-2xl">😊</button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 px-5 py-3 rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
          <button type="button" className="text-2xl">💬</button>
          <button type="button" className="text-2xl">📎</button>
          <button type="button" className="text-2xl">🎙️</button>
        </form>
      </main>

      {showCreate && (
        <CreateChannelModal
          contacts={contacts}
          onClose={() => setShowCreate(false)}
          onCreated={(room) => {
            setShowCreate(false)
            loadRooms(room.id)
          }}
        />
      )}
    </div>
  )
}

function CreateChannelModal({ contacts, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Channel name required')
    setLoading(true)
    try {
      const room = await api.createRoom(name.trim(), Array.from(selected))
      onCreated(room)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">New Private Channel</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Channel name"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div>
            <div className="text-xs font-medium text-slate-600 mb-2">
              Invite members ({selected.size} selected)
            </div>
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {contacts.length === 0 && (
                <p className="text-xs text-slate-400 px-3 py-4 text-center">No contacts.</p>
              )}
              {contacts.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-600">
                    {c.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{c.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{c.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
