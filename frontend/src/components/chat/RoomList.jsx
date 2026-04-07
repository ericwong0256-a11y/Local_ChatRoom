import Badge from '../ui/Badge.jsx'

function RoomItem({ room, active, count, onSelect, onTogglePin }) {
  return (
    <div
      className={`sidebar-row group cursor-pointer ${active ? 'sidebar-row-active' : ''}`}
      onClick={() => onSelect(room.id)}
    >
      <div className="avatar-lg text-lg">
        {room.is_dm ? room.name?.[0]?.toUpperCase() : room.is_private ? '🔒' : '👥'}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
          {room.name}
          {room.is_private && !room.is_dm && <Badge>private</Badge>}
        </div>
        <div className="text-sm text-slate-500 truncate">
          {room.is_dm ? 'Direct message' : 'Tap to open'}
        </div>
      </div>
      <button
        type="button"
        title={room.is_pinned ? 'Unpin' : 'Pin to top'}
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin(room)
        }}
        className={`text-base ml-1 ${
          room.is_pinned ? 'opacity-100 text-brand-500' : 'opacity-0 group-hover:opacity-60 hover:opacity-100'
        }`}
      >
        📌
      </button>
      {count > 0 && (
        <span className="ml-2 bg-brand-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-semibold">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </div>
  )
}

function sortPinnedFirst(list) {
  return [...list].sort((a, b) => (b.is_pinned || 0) - (a.is_pinned || 0))
}

export default function RoomList({ rooms, activeRoom, onSelect, onTogglePin, unread = {} }) {
  const channels = sortPinnedFirst(rooms.filter((r) => !r.is_dm))
  const dms = sortPinnedFirst(rooms.filter((r) => r.is_dm))

  return (
    <>
      {channels.length > 0 && (
        <>
          <SectionHeader>Channels</SectionHeader>
          {channels.map((r) => (
            <RoomItem
              key={r.id}
              room={r}
              active={activeRoom === r.id}
              count={unread[r.id] || 0}
              onSelect={onSelect}
              onTogglePin={onTogglePin}
            />
          ))}
        </>
      )}

      {dms.length > 0 && (
        <>
          <div className="border-t border-slate-100 mt-2" />
          <SectionHeader>Direct Messages</SectionHeader>
          {dms.map((r) => (
            <RoomItem
              key={r.id}
              room={r}
              active={activeRoom === r.id}
              count={unread[r.id] || 0}
              onSelect={onSelect}
              onTogglePin={onTogglePin}
            />
          ))}
        </>
      )}
    </>
  )
}
