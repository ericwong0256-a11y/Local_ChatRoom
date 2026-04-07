export default function MembersModal({ room, members, ownerId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">{room?.name} — Members</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {members.map((m) => (
            <li key={m.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-600">
                {m.full_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate flex items-center gap-2">
                  {m.full_name}
                  {m.id === ownerId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                      owner
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate">{m.email}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
