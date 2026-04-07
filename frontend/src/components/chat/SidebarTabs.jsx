const TABS = [
  { id: 'chats', label: 'Chats' },
  { id: 'contacts', label: 'Contacts' },
]

export default function SidebarTabs({ tab, setTab }) {
  return (
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
  )
}
