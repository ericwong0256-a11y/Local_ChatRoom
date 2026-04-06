import { useState, useRef, useEffect } from 'react'

const conversations = [
  { id: 1, name: 'Development Team', preview: 'Let\u2019s have a meeting at 3 PM', time: '10:15 AM', unread: 3, group: true, color: 'bg-brand-100', avatar: '👥' },
  { id: 2, name: 'John Doe', preview: 'Did you commit the changes?', time: '10:30 AM', img: 'https://i.pravatar.cc/80?img=12' },
  { id: 3, name: 'Sarah', preview: 'I\u2019ll review the PR now.', time: '9:15 AM', img: 'https://i.pravatar.cc/80?img=47' },
  { id: 4, name: 'Server Alerts', preview: 'Server is back online.', time: '8:50 AM', color: 'bg-red-500 text-white', avatar: '!' },
  { id: 5, name: 'UX Design', preview: 'New mockups are ready', time: 'Yesterday', color: 'bg-purple-500 text-white', avatar: '◆' },
  { id: 6, name: 'Alex', preview: 'Let\u2019s deploy the update.', time: 'Yesterday', img: 'https://i.pravatar.cc/80?img=15' },
  { id: 7, name: 'Database Logs', preview: 'Backups completed.', time: 'Yesterday', color: 'bg-slate-300 text-slate-700', avatar: '🗄' },
]

const initialMessages = [
  { id: 1, who: 'John Doe', text: 'Did you finish the latest task?', time: '10:15 AM', img: 'https://i.pravatar.cc/80?img=12' },
  { id: 2, who: 'Sarah', text: 'Yes, I completed it last night.', time: '10:17 AM', img: 'https://i.pravatar.cc/80?img=47' },
  { id: 3, who: 'Michael', text: 'Let\u2019s have a meeting at 3 PM.', time: '10:46 AM', img: 'https://i.pravatar.cc/80?img=33' },
  { id: 4, who: 'You', text: 'Sounds good, I\u2019ll join.', time: '10:46 AM', img: 'https://i.pravatar.cc/80?img=47', self: true },
  { id: 5, who: 'Sarah', text: 'Here\u2019s the new UI mockup I created.', time: '10:50 AM', img: 'https://i.pravatar.cc/80?img=47' },
  { id: 6, who: 'You', text: 'Wow, looks great! Let\u2019s discuss this in the meeting.', time: '10:52 AM', self: true },
]

export default function Chat({ go }) {
  const [active, setActive] = useState(1)
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        who: 'You',
        text: draft.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        self: true,
      },
    ])
    setDraft('')
  }

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
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 ${
                active === c.id ? 'bg-brand-50 border-brand-500' : 'border-transparent hover:bg-slate-50'
              }`}
            >
              {c.img ? (
                <img src={c.img} className="w-12 h-12 rounded-full object-cover" alt="" />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${c.color}`}>
                  {c.avatar}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 truncate">{c.name}</span>
                  <span className="text-xs text-slate-400 ml-2 shrink-0">{c.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 truncate">{c.preview}</span>
                  {c.unread && (
                    <span className="ml-2 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => go('settings')}
          className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 text-left"
        >
          ⚙️  Settings
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col chat-bg">
        {/* Header */}
        <header className="bg-brand-600 px-6 py-3 flex items-center gap-4 text-white">
          <button className="text-xl">←</button>
          <div className="flex-1">
            <div className="font-semibold text-lg leading-tight">Development Team</div>
            <div className="text-xs text-brand-100">4 members online</div>
          </div>
          <button className="text-xl">🔍</button>
          <button className="text-xl">📞</button>
          <button className="text-xl">⋯</button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-3 ${m.self ? 'justify-end' : ''}`}>
              {!m.self && (
                <img src={m.img} className="w-9 h-9 rounded-full object-cover" alt="" />
              )}
              <div className={`max-w-md ${m.self ? 'text-right' : ''}`}>
                {!m.self && (
                  <div className="text-sm font-semibold text-brand-600 mb-1">{m.who}</div>
                )}
                <div
                  className={`inline-block px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    m.self
                      ? 'bg-brand-500 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 rounded-tl-sm'
                  }`}
                >
                  {m.text}
                  <span className={`ml-2 text-[10px] ${m.self ? 'text-brand-100' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
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
