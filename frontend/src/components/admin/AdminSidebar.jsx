const TABS = [
  { id: 'stats', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'rooms', label: 'Channels' },
  { id: 'messages', label: 'Messages' },
]

export default function AdminSidebar({ me, tab, setTab, go }) {
  return (
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
        <button onClick={() => go('chat')} className="mt-3 w-full text-left link">
          ← Back to Chat
        </button>
      </div>
    </aside>
  )
}

export { TABS as ADMIN_TABS }
