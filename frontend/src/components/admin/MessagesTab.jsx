import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'

export default function MessagesTab() {
  const [rooms, setRooms] = useState([])
  const [roomId, setRoomId] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    api.admin.rooms().then((r) => {
      setRooms(r)
      if (r[0]) setRoomId(r[0].id)
    })
  }, [])

  const loadMessages = () => {
    if (roomId) api.admin.roomMessages(roomId).then(setMessages)
  }
  useEffect(loadMessages, [roomId])

  const remove = async (m) => {
    if (!confirm('Delete this message?')) return
    await api.admin.deleteMessage(m.id)
    loadMessages()
  }

  return (
    <>
      <div className="mb-4">
        <select
          value={roomId || ''}
          onChange={(e) => setRoomId(Number(e.target.value))}
          className="input input-sm max-w-xs"
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Message</th>
              <th>Sent</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="align-top">
                <td className="text-slate-800">
                  <div className="font-medium">{m.author}</div>
                  <div className="text-xs text-slate-400">{m.email}</div>
                </td>
                <td className="text-slate-700 max-w-md break-words">{m.body}</td>
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
                <td colSpan={4} className="text-center text-slate-400 py-8">
                  No messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
