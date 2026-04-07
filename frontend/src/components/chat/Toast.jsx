import { useEffect } from 'react'

export default function Toast({ toast, onClose, onClick }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [])

  const preview = toast.image
    ? '📷 Sent an image'
    : toast.audio
      ? '🎙️ Sent a voice message'
      : toast.body

  return (
    <div className="toast" onClick={onClick} role="alert">
      <div className="toast-accent" />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="toast-body">
          <div className="avatar-md shrink-0">
            {toast.author?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="toast-room truncate">{toast.roomName || 'New message'}</div>
            <div className="toast-title">{toast.author}</div>
            <div className="toast-preview">{preview}</div>
          </div>
        </div>
        <div className="toast-progress" />
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        ×
      </button>
    </div>
  )
}
