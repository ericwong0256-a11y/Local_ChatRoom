export default function SettingsHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
      <button onClick={onClose} className="text-slate-500 hover:text-slate-700">←</button>
      <h2 className="font-semibold text-slate-800">Settings</h2>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
    </div>
  )
}
