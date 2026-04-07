export default function ActivityChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-slate-800">Message Activity</div>
          <div className="text-xs text-slate-400">Last 7 days</div>
        </div>
        <div className="text-xs text-slate-500">
          Total: <span className="font-semibold text-slate-700">
            {data.reduce((a, b) => a + b.count, 0)}
          </span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-40">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-brand-500/80 hover:bg-brand-500 rounded-t-md transition relative group"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: 2 }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100">
                {d.count}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">{d.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
