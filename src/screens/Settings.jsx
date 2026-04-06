import { useState } from 'react'

const tabs = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
  { id: 'data', label: 'Data and Storage', icon: '💾' },
]

export default function Settings({ go }) {
  const [active, setActive] = useState('account')
  const [autoDl, setAutoDl] = useState(true)

  return (
    <div className="auth-bg min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <button onClick={() => go('chat')} className="text-slate-500 hover:text-slate-700">
            ←
          </button>
          <h2 className="font-semibold text-slate-800">Settings</h2>
          <button onClick={() => go('chat')} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
          <img
            src="https://i.pravatar.cc/80?img=12"
            className="w-14 h-14 rounded-full object-cover"
            alt=""
          />
          <div>
            <div className="font-semibold text-slate-800">John Doe</div>
            <div className="text-sm text-slate-500">johndoe@example.com</div>
          </div>
        </div>

        <div className="grid grid-cols-[220px,1fr] min-h-[460px]">
          {/* Sidebar */}
          <aside className="border-r border-slate-100 py-3">
            {tabs.map((t) => (
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
              <button className="w-full text-left px-5 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-50">
                <span>⊖</span> Log Out
              </button>
            </div>
          </aside>

          {/* Content */}
          <section className="px-6 py-5 overflow-y-auto">
            <h3 className="font-semibold text-slate-800 mb-3">Account</h3>
            <div className="space-y-3">
              <input
                defaultValue="John Doe"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                defaultValue="@johndoe"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <h3 className="font-semibold text-slate-800 mt-5 mb-2">Bio</h3>
            <textarea
              placeholder="Write a few words about yourself..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <h3 className="font-semibold text-slate-800 mt-5 mb-2">Change Email</h3>
            <input
              defaultValue="johndoe@example.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <h3 className="font-semibold text-slate-800 mt-5 mb-2">Language</h3>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 text-sm">
              <span>English</span>
              <button className="text-brand-600 font-medium">Browse</button>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-medium text-slate-800">Auto-download path</span>
              <button
                onClick={() => setAutoDl(!autoDl)}
                className={`w-11 h-6 rounded-full relative transition ${
                  autoDl ? 'bg-brand-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                    autoDl ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <label className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" defaultChecked /> Photos
                </span>
                <span className="text-xs px-2 py-1 border border-slate-200 rounded">1 MB</span>
              </label>
              <label className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" defaultChecked /> Files
                </span>
                <select className="text-xs px-2 py-1 border border-slate-200 rounded">
                  <option>1 MB</option>
                  <option>5 MB</option>
                  <option>10 MB</option>
                </select>
              </label>
            </div>

            <button className="mt-6 w-full py-2 rounded-lg border border-red-400 text-red-500 font-medium hover:bg-red-50">
              Delete Account
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
