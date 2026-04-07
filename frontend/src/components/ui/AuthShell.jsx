import Logo from '../Logo.jsx'

export default function AuthShell({ title, children, footer }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <Logo />
        </div>
        <div className="auth-body">
          {title && <h1 className="auth-title">{title}</h1>}
          {children}
          {footer && <p className="text-center text-xs text-slate-500 mt-5">{footer}</p>}
        </div>
      </div>
    </div>
  )
}
