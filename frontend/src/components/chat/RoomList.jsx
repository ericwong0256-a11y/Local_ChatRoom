import Badge from '../ui/Badge.jsx'

export default function RoomList({ rooms, activeRoom, onSelect }) {
  return (
    <>
      {rooms.map((r) => (
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
        </button>
      ))}
    </>
  )
}
