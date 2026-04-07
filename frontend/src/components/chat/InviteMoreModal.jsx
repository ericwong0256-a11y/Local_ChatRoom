import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { api } from '../../lib/api.js'

export default function InviteMoreModal({ room, contacts, members, onClose, onInvited }) {
  const memberIds = new Set(members.map((m) => m.id))
  const candidates = contacts.filter((c) => !memberIds.has(c.id))
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const submit = async () => {
    setError('')
    if (selected.size === 0) return
    setLoading(true)
    try {
      await api.inviteMore(room.id, Array.from(selected))
      onInvited?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={`Invite to ${room?.name}`} size="md" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <div className="label mb-2">Select users ({selected.size} selected)</div>
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
            {candidates.length === 0 && (
              <p className="text-xs text-slate-400 px-3 py-4 text-center">
                Everyone is already a member.
              </p>
            )}
            {candidates.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                />
                <div className="avatar-sm">{c.full_name?.[0]?.toUpperCase()}</div>
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
        {error && <p className="field-error">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={loading || selected.size === 0}>
            {loading ? 'Sending...' : 'Send Invites'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
