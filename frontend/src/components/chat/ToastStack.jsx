import Toast from './Toast.jsx'

export default function ToastStack({ toasts, onDismiss, onOpen }) {
  if (!toasts.length) return null
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          toast={t}
          onClose={() => onDismiss(t.id)}
          onClick={() => onOpen(t)}
        />
      ))}
    </div>
  )
}
