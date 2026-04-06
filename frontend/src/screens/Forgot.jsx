import { useState } from 'react'
import Logo from '../components/Logo.jsx'
import { api } from '../lib/api.js'

export default function Forgot({ go }) {
  const [step, setStep] = useState('request') // 'request' | 'reset'
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
      // Dev convenience: backend returns the token
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
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
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
    <div className="auth-bg min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-600 py-5 flex items-center justify-center">
          <Logo />
        </div>
        <div className="pattern-card px-7 py-8">
          <h1 className="text-xl font-semibold text-slate-800 text-center mb-6">
            {step === 'request' ? 'Reset your password' : 'Enter reset token'}
          </h1>

          {step === 'request' ? (
            <form className="space-y-3" onSubmit={requestToken}>
              <p className="text-xs text-slate-500 text-center mb-2">
                Enter your email and we'll issue a reset token.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Reset Token'}
              </button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={resetPassword}>
              {devToken && (
                <div className="text-[11px] bg-amber-50 border border-amber-200 rounded p-2 text-amber-800 break-all">
                  <div className="font-semibold mb-1">Dev token (also in backend console):</div>
                  <code>{devToken}</code>
                </div>
              )}
              <input
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Reset token"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                required
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition disabled:opacity-60"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-5">
            <button onClick={() => go('signin')} className="text-brand-600 font-medium">
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
