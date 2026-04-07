import { useState } from 'react'
import Button from '../ui/Button.jsx'
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
  onSelectContact,
  onCreateChannel,
  go,
}) {
  const [tab, setTab] = useState('chats')

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-600" fill="currentColor">
            <path d="M21.5 2.5L2 11l6 2.2L18 5.5 10 14l8.5 7.5L21.5 2.5z" />
          </svg>
        </div>
        <span className="text-white text-xl font-bold">MG_CHAT</span>
      </div>

      <SidebarTabs tab={tab} setTab={setTab} />

      {tab === 'chats' && (
        <Button block className="mx-4 mt-3" onClick={onCreateChannel}>
          + New Private Channel
        </Button>
      )}

      <div className="sidebar-search-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input placeholder="Search" className="sidebar-search" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'chats' && (
          <RoomList rooms={rooms} activeRoom={activeRoom} onSelect={onSelectRoom} />
        )}
        {tab === 'contacts' && <ContactList contacts={contacts} onSelect={onSelectContact} />}
      </div>

      <SidebarFooter me={me} go={go} />
    </aside>
  )
}
