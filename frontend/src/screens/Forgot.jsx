import { useState } from 'react'
import AuthShell from '../components/ui/AuthShell.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { api } from '../lib/api.js'

export default function Forgot({ go }) {
  const [step, setStep] = useState('request')
  const [email, setEmail] = useState('')
  const [devToken, setDevToken] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const requestToken = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.forgot(email)
      if (data.token) setDevToken(data.token)
      setStep('reset')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      await api.reset(token, password)
      alert('Password reset successful. Please sign in.')
      go('signin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={step === 'request' ? 'Reset your password' : 'Enter reset token'}
      footer={
        <button onClick={() => go('signin')} className="auth-footer-link">
          Back to sign in
        </button>
      }
    >
      {step === 'request' ? (
        <form className="space-y-3" onSubmit={requestToken}>
          <p className="text-xs text-slate-500 text-center mb-2">
            Enter your email and we'll issue a reset token.
          </p>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          {error && <p className="field-error">{error}</p>}
          <Button type="submit" block disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Token'}
          </Button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={resetPassword}>
          {devToken && (
            <div className="text-[11px] bg-amber-50 border border-amber-200 rounded p-2 text-amber-800 break-all">
              <div className="font-semibold mb-1">Dev token (also in backend console):</div>
              <code>{devToken}</code>
            </div>
          )}
          <Input
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Reset token"
          />
          <Input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
          />
          <Input
            required
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
          />
          {error && <p className="field-error">{error}</p>}
          <Button type="submit" block disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
