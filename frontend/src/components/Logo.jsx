export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-600" fill="currentColor">
          <path d="M21.5 2.5L2 11l6 2.2L18 5.5 10 14l8.5 7.5L21.5 2.5z" />
        </svg>
      </div>
      <span className="text-white text-2xl font-bold tracking-wide">MG_CHAT</span>
    </div>
  )
}
