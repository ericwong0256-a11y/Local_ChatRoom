import { useEffect, useState } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { api } from '../../lib/api.js'

export default function RoomsTab() {
  const [rooms, setRooms] = useState([])
  const [name, setName] = useState('')
  const load = () => api.admin.rooms().then(setRooms).catch(() => {})
  useEffect(load, [])

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await api.admin.createRoom(name.trim())
    setName('')
    load()
  }
  const rename = async (r) => {
    const next = prompt('New name', r.name)
    if (!next?.trim()) return
    await api.admin.renameRoom(r.id, next.trim())
    load()
  }
  const remove = async (r) => {
    if (!confirm(`Delete channel "${r.name}" and all its messages?`)) return
    await api.admin.deleteRoom(r.id)
    load()
  }

  return (
    <>
      <form onSubmit={create} className="flex gap-2 mb-6">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New channel name"
        />
        <Button type="submit">Create</Button>
      </form>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Messages</th>
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td className="font-medium text-slate-800">{r.name}</td>
                <td className="text-slate-600">{r.message_count}</td>
                <td className="text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="text-right space-x-2">
                  <button onClick={() => rename(r)} className="link">Rename</button>
                  <button onClick={() => remove(r)} className="link-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
