import { useState } from 'react'
import AuthShell from '../components/ui/AuthShell.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'

export default function SignUp({ go }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      const data = await api.signup({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      })
      auth.save(data)
      go('chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create an account"
      footer={
        <>
          Already have an account?{' '}
          <button onClick={() => go('signin')} className="auth-footer-link">
            Sign in
          </button>
        </>
      }
    >
      <form className="space-y-3" onSubmit={submit}>
        <Input required value={form.full_name} onChange={set('full_name')} placeholder="Full Name" />
        <Input required type="email" value={form.email} onChange={set('email')} placeholder="Email" />
        <Input required type="password" value={form.password} onChange={set('password')} placeholder="Password" />
        <Input required type="password" value={form.confirm} onChange={set('confirm')} placeholder="Confirm Password" />
        {error && <p className="field-error">{error}</p>}
        <Button type="submit" block disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </Button>
      </form>
    </AuthShell>
  )
}
