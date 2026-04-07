import Badge from '../ui/Badge.jsx'

export default function ContactList({ contacts, onSelect }) {
  if (contacts.length === 0) {
    return <p className="text-center text-sm text-slate-400 py-8">No contacts yet.</p>
  }
  return (
    <>
      {contacts.map((c) => (
        <button key={c.id} onClick={() => onSelect?.(c)} className="sidebar-row">
          <div className="avatar-lg">{c.full_name?.[0]?.toUpperCase()}</div>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
              {c.full_name}
              {c.is_admin && <Badge variant="brand">admin</Badge>}
            </div>
            <div className="text-xs text-slate-500 truncate">{c.email}</div>
          </div>
        </button>
      ))}
    </>
  )
}
