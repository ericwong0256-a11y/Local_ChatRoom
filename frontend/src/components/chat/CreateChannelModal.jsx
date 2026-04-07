import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
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
    <Modal title="New Private Channel" size="md" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Channel name"
        />
        <div>
          <div className="label mb-2">Invite members ({selected.size} selected)</div>
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
                <div className="avatar-sm">{c.full_name?.[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{c.full_name}</div>
                  <div className="text-xs text-slate-500 truncate">{c.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
