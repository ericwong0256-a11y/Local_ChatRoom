import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import StatCard from './StatCard.jsx'
import ActivityChart from './ActivityChart.jsx'

function fmtRelative(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(ts).toLocaleDateString()
}

function preview(m) {
  if (m.image) return '📷 Image'
  if (m.audio) return '🎙️ Voice message'
  return m.body || ''
}

export default function StatsTab() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.admin.stats().then(setData).catch(() => {})
  }, [])

  if (!data) return <p className="text-slate-500">Loading dashboard...</p>

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={data.users}
          hint={`${data.admins} admin${data.admins === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Active This Week"
          value={data.activeUsersThisWeek}
          hint={`${data.newUsersThisWeek} new signup${data.newUsersThisWeek === 1 ? '' : 's'}`}
          accent="green"
        />
        <StatCard
          label="Channels"
          value={data.publicRooms + data.privateRooms}
          hint={`${data.publicRooms} public • ${data.privateRooms} private`}
          accent="amber"
        />
        <StatCard
          label="Messages Today"
          value={data.messagesToday}
          hint={`${data.messages.toLocaleString()} all-time`}
          accent="red"
        />
      </div>

      {/* Activity chart full-width */}
      <ActivityChart data={data.activity} />

      {/* Two-column lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top channels */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Top Channels</span>
            <span className="text-xs text-slate-400">By message count</span>
          </div>
          <ul>
            {data.topRooms.map((r, i) => (
              <li
                key={r.id}
                className="px-5 py-3 border-b border-slate-50 last:border-0 flex items-center gap-3"
              >
                <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                <span className="text-lg">
                  {r.is_dm ? '💬' : r.is_private ? '🔒' : '👥'}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                  {r.name}
                </span>
                <span className="text-xs font-semibold text-brand-600">
                  {r.message_count.toLocaleString()}
                </span>
              </li>
            ))}
            {data.topRooms.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-slate-400">No data yet.</li>
            )}
          </ul>
        </div>

        {/* Recent users */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800">
            Recent Signups
          </div>
          <ul>
            {data.recentUsers.map((u) => (
              <li
                key={u.id}
                className="px-5 py-3 border-b border-slate-50 last:border-0 flex items-center gap-3"
              >
                <div className="avatar-md">{u.full_name?.[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {u.full_name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {fmtRelative(u.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent messages — full width */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-800">
          Recent Messages
        </div>
        <ul>
          {data.recentMessages.map((m) => (
            <li
              key={m.id}
              className="px-5 py-3 border-b border-slate-50 last:border-0 flex items-start gap-3"
            >
              <div className="avatar-sm shrink-0">{m.author?.[0]?.toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">{m.author}</span>{' '}
                  <span className="text-xs text-slate-400">in</span>{' '}
                  <span className="text-xs font-medium text-brand-600">{m.room_name}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">{preview(m)}</div>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {fmtRelative(m.created_at)}
              </span>
            </li>
          ))}
          {data.recentMessages.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-slate-400">No messages yet.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
