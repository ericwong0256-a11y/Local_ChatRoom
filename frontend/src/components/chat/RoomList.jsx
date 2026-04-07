export default function RoomList({ rooms, activeRoom, onSelect }) {
  return (
    <>
      {rooms.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 ${
            activeRoom === r.id
              ? 'bg-brand-50 border-brand-500'
              : 'border-transparent hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-lg">
            {r.is_private ? '🔒' : '👥'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
              {r.name}
              {r.is_private ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  private
                </span>
              ) : null}
            </div>
            <div className="text-sm text-slate-500 truncate">Tap to open</div>
          </div>
        </button>
      ))}
    </>
  )
}
