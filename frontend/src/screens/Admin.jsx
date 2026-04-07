import { useState } from 'react'
import { auth } from '../lib/auth.js'
import AdminSidebar, { ADMIN_TABS } from '../components/admin/AdminSidebar.jsx'
import StatsTab from '../components/admin/StatsTab.jsx'
import UsersTab from '../components/admin/UsersTab.jsx'
import RoomsTab from '../components/admin/RoomsTab.jsx'
import MessagesTab from '../components/admin/MessagesTab.jsx'

export default function Admin({ go }) {
  const [tab, setTab] = useState('stats')
  const me = auth.user()

  return (
    <div className="h-full flex bg-slate-50">
      <AdminSidebar me={me} tab={tab} setTab={setTab} go={go} />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-slate-800">
            {ADMIN_TABS.find((t) => t.id === tab)?.label}
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
