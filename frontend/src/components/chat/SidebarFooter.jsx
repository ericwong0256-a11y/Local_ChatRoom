import Button from '../ui/Button.jsx'

export default function SidebarFooter({ me, go }) {
  return (
    <div className="border-t border-slate-100 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-700 truncate">{me?.full_name}</div>
        {me?.is_admin && (
          <button onClick={() => go('admin')} className="badge-brand hover:bg-brand-200">
            Admin
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="btn-sm" block onClick={() => go('settings')}>
          ⚙️ Settings
        </Button>
        <Button
          variant="danger"
          className="btn-sm"
          block
          onClick={() => confirm('Sign out?') && go('signin')}
        >
          ⎋ Sign Out
        </Button>
      </div>
    </div>
  )
}
