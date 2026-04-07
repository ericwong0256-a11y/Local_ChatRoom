import { useState } from 'react'
import { api } from '../../lib/api.js'

export default function CreateChannelModal({ contacts, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Channel name required')
    setLoading(true)
    try {
      const room = await api.createRoom(name.trim(), Array.from(selected))
      onCreated(room)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">New Private Channel</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Channel name"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div>
            <div className="text-xs font-medium text-slate-600 mb-2">
              Invite members ({selected.size} selected)
            </div>
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {contacts.length === 0 && (
                <p className="text-xs text-slate-400 px-3 py-4 text-center">No contacts.</p>
              )}
              {contacts.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-600">
                    {c.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {c.full_name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{c.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
