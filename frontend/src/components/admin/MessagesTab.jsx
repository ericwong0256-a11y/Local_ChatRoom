import { useEffect, useState } from 'react'
import { useConfirm } from '../ui/ConfirmProvider.jsx'
import { api } from '../../lib/api.js'

// Highlight every occurrence of any keyword in `text` (case-insensitive)
function HighlightedText({ text, keywords }) {
  if (!text) return null
  if (!keywords || keywords.length === 0) return <>{text}</>
  // Build a single regex from escaped keywords
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark
            key={i}
            className="bg-amber-200 text-amber-900 font-semibold px-0.5 rounded"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export default function MessagesTab() {
  const confirm = useConfirm()
  const [messages, setMessages] = useState([])

  const load = () => api.admin.flaggedMessages().then(setMessages).catch(() => {})
  useEffect(() => { load() }, [])

  const remove = async (m) => {
    if (!(await confirm({
      title: 'Delete message',
      message: 'Delete this flagged message?',
      confirmText: 'Delete',
      danger: true,
    }))) return
    await api.admin.deleteMessage(m.id)
    load()
  }

  return (
    <>
      <p className="text-sm text-slate-500 mb-4">
        Messages flagged by registered keywords. Manage keywords in the{' '}
        <span className="font-medium text-slate-700">Keywords</span> tab.
      </p>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Channel</th>
              <th>Content</th>
              <th>Time</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="align-top">
                <td className="text-slate-800">
                  <div className="font-medium">{m.sender_name}</div>
                  <div className="text-xs text-slate-400">{m.sender_email}</div>
                </td>
                <td className="text-slate-800">
                  <div className="font-medium">{m.recipient_name}</div>
                  <div className="text-xs text-slate-400">
                    {m.recipient_kind === 'user'
                      ? m.is_dm
                        ? 'Direct message'
                        : 'Private channel'
                      : 'Channel'}
                  </div>
                </td>
                <td className="text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span>{m.is_dm ? '💬' : '🔒'}</span>
                    <span className="font-medium">{m.room_name}</span>
                  </span>
                </td>
                <td className="text-slate-700 max-w-md break-words">
                  <HighlightedText text={m.body} keywords={m.matched_words} />
                </td>
                <td className="text-slate-500 whitespace-nowrap">
                  {new Date(m.created_at).toLocaleString()}
                </td>
                <td className="text-right">
                  <button onClick={() => remove(m)} className="link-danger">Delete</button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate-400 py-8">
                  No flagged messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
