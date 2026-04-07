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
  onShowInvites,
  inviteCount = 0,
  unread,
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
        <div className="mx-4 mt-3 flex gap-2">
          <Button block onClick={onCreateChannel}>
            + New Private Channel
          </Button>
          <button
            type="button"
            onClick={onShowInvites}
            title="Pending invites"
            className="relative px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm"
          >
            ✉️
            {inviteCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-semibold">
                {inviteCount}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="sidebar-search-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input placeholder="Search" className="sidebar-search" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'chats' && (
          <RoomList
            rooms={rooms}
            activeRoom={activeRoom}
            onSelect={onSelectRoom}
            unread={unread}
          />
        )}
        {tab === 'contacts' && <ContactList contacts={contacts} onSelect={onSelectContact} />}
      </div>

      <SidebarFooter me={me} go={go} />
    </aside>
  )
}
