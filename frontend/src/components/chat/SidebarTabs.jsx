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
          className={`sidebar-tab ${tab === t.id ? 'sidebar-tab-active' : ''}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
