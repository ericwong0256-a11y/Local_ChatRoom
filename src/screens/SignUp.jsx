import Logo from '../components/Logo.jsx'

export default function SignUp({ go }) {
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
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              go('chat')
            }}
          >
            {['Full Name', 'Email', 'Password', 'Confirm Password'].map((p) => (
              <input
                key={p}
                type={p.toLowerCase().includes('password') ? 'password' : 'text'}
                placeholder={p}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            ))}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition"
            >
              Sign Up
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
