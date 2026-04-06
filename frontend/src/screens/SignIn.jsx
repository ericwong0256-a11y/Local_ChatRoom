import { useState } from 'react'
import Logo from '../components/Logo.jsx'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'

export default function SignIn({ go }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.signin({ email, password })
      auth.save(data)
      go('chat')
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
            Sign in to MG_CHAT
          </h1>
          <form className="space-y-3" onSubmit={submit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 pr-28"
              />
              <button
                type="button"
                onClick={() => go('forgot')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-600 font-medium"
              >
                Forgot password?
              </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-slate-500 mt-5">
            Don't have an account?{' '}
            <button onClick={() => go('signup')} className="text-brand-600 font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
