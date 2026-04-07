import Badge from '../ui/Badge.jsx'

export default function RoomList({ rooms, activeRoom, onSelect, unread = {} }) {
  return (
    <>
      {rooms.map((r) => {
        const count = unread[r.id] || 0
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={`sidebar-row ${activeRoom === r.id ? 'sidebar-row-active' : ''}`}
          >
            <div className="avatar-lg text-lg">{r.is_private ? '🔒' : '👥'}</div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
                {r.name}
                {r.is_private && <Badge>private</Badge>}
              </div>
              <div className="text-sm text-slate-500 truncate">Tap to open</div>
            </div>
            {count > 0 && (
              <span className="ml-2 bg-brand-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-semibold">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        )
      })}
    </>
  )
}
