import { useEffect, useState } from 'react'
import Badge from '../ui/Badge.jsx'
import { useConfirm } from '../ui/ConfirmProvider.jsx'
import { api } from '../../lib/api.js'
import { auth } from '../../lib/auth.js'

export default function UsersTab() {
  const confirm = useConfirm()
  const [users, setUsers] = useState([])
  const me = auth.user()
  const load = () => api.admin.users().then(setUsers).catch(() => {})
  useEffect(() => { load() }, [])

  const toggleAdmin = async (u) => {
    await api.admin.setAdmin(u.id, !u.is_admin)
    load()
  }
  const remove = async (u) => {
    if (!(await confirm({
      title: 'Delete user',
      message: `Delete ${u.email}? This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    }))) return
    await api.admin.deleteUser(u.id)
    load()
  }

  return (
    <div className="card overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Role</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="font-medium text-slate-800">{u.full_name}</td>
              <td className="text-slate-600">{u.email}</td>
              <td className="text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                {u.is_admin ? <Badge variant="brand">Admin</Badge> : <Badge>User</Badge>}
              </td>
              <td className="text-right space-x-2">
                <button
                  onClick={() => toggleAdmin(u)}
                  disabled={u.id === me?.id}
                  className="link disabled:text-slate-300 disabled:no-underline"
                >
                  {u.is_admin ? 'Demote' : 'Promote'}
                </button>
                <button
                  onClick={() => remove(u)}
                  disabled={u.id === me?.id}
                  className="link-danger disabled:text-slate-300 disabled:no-underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
