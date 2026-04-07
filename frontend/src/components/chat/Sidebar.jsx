import { useState } from 'react'
import SidebarTabs from './SidebarTabs.jsx'
import RoomList from './RoomList.jsx'
import ContactList from './ContactList.jsx'
import SidebarFooter from './SidebarFooter.jsx'

export default function Sidebar({
  me,
  rooms,
  contacts,
  activeRoom,
  onSelectRoom,
  onCreateChannel,
  go,
}) {
  const [tab, setTab] = useState('chats')

  return (
    <aside className="w-[320px] flex flex-col border-r border-slate-200 bg-white">
      <div className="bg-brand-600 px-5 py-4 flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-600" fill="currentColor">
            <path d="M21.5 2.5L2 11l6 2.2L18 5.5 10 14l8.5 7.5L21.5 2.5z" />
          </svg>
        </div>
        <span className="text-white text-xl font-bold">MG_CHAT</span>
      </div>

      <SidebarTabs tab={tab} setTab={setTab} />

      {tab === 'chats' && (
        <button
          onClick={onCreateChannel}
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
        {tab === 'chats' && (
          <RoomList rooms={rooms} activeRoom={activeRoom} onSelect={onSelectRoom} />
        )}
        {tab === 'contacts' && <ContactList contacts={contacts} />}
      </div>

      <SidebarFooter me={me} go={go} />
    </aside>
  )
}
