import { useState } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { api } from '../../lib/api.js'
import { auth } from '../../lib/auth.js'

export default function AccountPanel({ me, onUpdated }) {
  const [name, setName] = useState(me.full_name)
  const [email, setEmail] = useState(me.email)
  const [status, setStatus] = useState('')

  const save = async () => {
    setStatus('')
    try {
      const updated = await api.updateMe({ full_name: name, email })
      const cached = auth.user() || {}
      auth.save({
        token: auth.token(),
        user: { ...cached, full_name: updated.full_name, email: updated.email },
      })
      onUpdated?.(updated)
      setStatus('Saved')
      setTimeout(() => setStatus(''), 2000)
    } catch (err) {
      setStatus(err.message)
    }
  }

  return (
    <>
      <h3 className="font-semibold text-slate-800 mb-3">Account</h3>
      <div className="space-y-3">
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex items-center gap-3">
          <Button onClick={save}>Save changes</Button>
          {status && <span className="text-xs text-slate-500">{status}</span>}
        </div>
      </div>
    </>
  )
}
