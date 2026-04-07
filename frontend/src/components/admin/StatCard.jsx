export default function StatCard({ label, value, hint, accent = 'brand' }) {
  const dot =
    accent === 'green' ? 'bg-emerald-500'
      : accent === 'amber' ? 'bg-amber-500'
        : accent === 'red' ? 'bg-red-500'
          : 'bg-brand-500'
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${dot}`} />
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </div>
      <div className="text-3xl font-bold text-slate-800 mt-2">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  )
}
