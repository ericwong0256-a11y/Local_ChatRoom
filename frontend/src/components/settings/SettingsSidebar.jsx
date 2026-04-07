const TABS = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
  { id: 'data', label: 'Data and Storage', icon: '💾' },
]

export default function SettingsSidebar({ active, setActive, onSignOut }) {
  return (
    <aside className="border-r border-slate-100 py-3">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          className={`w-full text-left px-5 py-3 flex items-center gap-3 text-sm ${
            active === t.id
              ? 'text-brand-600 font-medium bg-brand-50'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{t.icon}</span>
          {t.label}
        </button>
      ))}
      <div className="border-t border-slate-100 mt-2 pt-2">
        <button
          onClick={onSignOut}
          className="w-full text-left px-5 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-50"
        >
          <span>⊖</span> Log Out
        </button>
      </div>
    </aside>
  )
}
