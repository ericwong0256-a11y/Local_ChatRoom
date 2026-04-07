import { useState } from 'react'
import AuthShell from '../components/ui/AuthShell.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'

export default function SignIn({ go }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.signin({ identifier, password })
      auth.save(data)
      go(data.user?.is_admin ? 'admin' : 'chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign in to MG_CHAT"
      footer={
        <>
          Don't have an account?{' '}
          <button onClick={() => go('signup')} className="auth-footer-link">
            Sign up
          </button>
        </>
      }
    >
      <form className="space-y-3" onSubmit={submit}>
        <Input
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or username"
        />
        <div className="relative">
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="pr-28"
          />
          <button
            type="button"
            onClick={() => go('forgot')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs auth-footer-link"
          >
            Forgot password?
          </button>
        </div>
        {error && <p className="field-error">{error}</p>}
        <Button type="submit" block disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </AuthShell>
  )
}
