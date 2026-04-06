import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'
import { getSocket } from '../lib/socket.js'

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat({ go }) {
  const me = auth.user()
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  // Load rooms once
  useEffect(() => {
    api
      .rooms()
      .then((r) => {
        setRooms(r)
        if (r[0]) setActiveRoom(r[0].id)
      })
      .catch((err) => {
        if (err.message === 'Unauthorized') go('signin')
      })
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
          {rooms.map((r) => (
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
                👥
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-semibold text-slate-800 truncate">{r.name}</div>
                <div className="text-sm text-slate-500 truncate">Tap to open</div>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-600 truncate">{me?.full_name}</div>
          <div className="flex gap-2">
            {me?.is_admin && (
              <button
                onClick={() => go('admin')}
                className="text-xs px-2 py-1 rounded bg-brand-100 text-brand-700 font-medium hover:bg-brand-200"
              >
                Admin
              </button>
            )}
            <button onClick={() => go('settings')} className="text-sm text-slate-500 hover:text-slate-700">
              ⚙️
            </button>
            <button onClick={() => go('signin')} className="text-sm text-red-500 hover:text-red-600">
              ⎋
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
    </div>
  )
}
