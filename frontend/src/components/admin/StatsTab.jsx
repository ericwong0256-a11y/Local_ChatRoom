import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'

export default function StatsTab() {
  const [data, setData] = useState(null)
  useEffect(() => {
    api.admin.stats().then(setData).catch(() => {})
  }, [])
  if (!data) return <p className="text-slate-500">Loading...</p>

  const cards = [
    { label: 'Total Users', value: data.users },
    { label: 'Admins', value: data.admins },
    { label: 'Channels', value: data.rooms },
    { label: 'Messages', value: data.messages },
  ]
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="text-xs uppercase text-slate-500 font-medium">{c.label}</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 card">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800">
          Recent Signups
        </div>
        <ul>
          {data.recentUsers.map((u) => (
            <li
              key={u.id}
              className="px-5 py-3 border-b border-slate-50 last:border-0 flex justify-between text-sm"
            >
              <span className="text-slate-700">
                <span className="font-medium">{u.full_name}</span>{' '}
                <span className="text-slate-400">({u.email})</span>
              </span>
              <span className="text-slate-400">{new Date(u.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
