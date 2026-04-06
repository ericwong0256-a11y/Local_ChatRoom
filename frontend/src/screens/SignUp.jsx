import { useState } from 'react'
import Logo from '../components/Logo.jsx'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'

export default function SignUp({ go }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
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
    <div className="auth-bg min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-600 py-5 flex items-center justify-center">
          <Logo />
        </div>
        <div className="pattern-card px-7 py-8">
          <h1 className="text-xl font-semibold text-slate-800 text-center mb-6">
            Create an account
          </h1>
          <form className="space-y-3" onSubmit={submit}>
            <input
              required
              value={form.full_name}
              onChange={set('full_name')}
              placeholder="Full Name"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="Email"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              required
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Password"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              required
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Confirm Password"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{' '}
            <button onClick={() => go('signin')} className="text-brand-600 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
