export default function SidebarFooter({ me, go }) {
  return (
    <div className="border-t border-slate-100 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-700 truncate">{me?.full_name}</div>
        {me?.is_admin && (
          <button
            onClick={() => go('admin')}
            className="text-xs px-2 py-1 rounded bg-brand-100 text-brand-700 font-medium hover:bg-brand-200"
          >
            Admin
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => go('settings')}
          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => {
            if (confirm('Sign out?')) go('signin')
          }}
          className="flex-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 font-medium"
        >
          ⎋ Sign Out
        </button>
      </div>
    </div>
  )
}
