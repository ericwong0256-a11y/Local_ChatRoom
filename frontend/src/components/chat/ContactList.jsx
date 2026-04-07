export default function ContactList({ contacts }) {
  if (contacts.length === 0) {
    return <p className="text-center text-sm text-slate-400 py-8">No contacts yet.</p>
  }
  return (
    <>
      {contacts.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-l-4 border-transparent"
        >
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-base font-semibold text-brand-600">
            {c.full_name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
              {c.full_name}
              {c.is_admin ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                  admin
                </span>
              ) : null}
            </div>
            <div className="text-xs text-slate-500 truncate">{c.email}</div>
          </div>
        </div>
      ))}
    </>
  )
}
