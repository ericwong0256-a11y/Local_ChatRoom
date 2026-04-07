import Badge from '../ui/Badge.jsx'

export default function ProfileSummary({ me }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
      <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-600">
        {me.full_name?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-slate-800 flex items-center gap-2">
          {me.full_name}
          {me.is_admin ? <Badge variant="brand">admin</Badge> : null}
        </div>
        <div className="text-sm text-slate-500">{me.email}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          Joined {new Date(me.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
