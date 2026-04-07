import { useRef } from 'react'
import ComposerPreviews from './ComposerPreviews.jsx'

export default function Composer({
  draft,
  setDraft,
  onSend,
  pendingImage,
  pendingAudio,
  setPendingImage,
  setPendingAudio,
  onOpenScreenCapture,
  recording,
  recordSecs,
  onToggleRecord,
}) {
  const fileInputRef = useRef(null)

  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Please choose an image.')
    if (file.size > 2 * 1024 * 1024) return alert('Image must be under 2 MB.')
    const reader = new FileReader()
    reader.onload = () => setPendingImage(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <>
      <ComposerPreviews
        pendingImage={pendingImage}
        pendingAudio={pendingAudio}
        recording={recording}
        recordSecs={recordSecs}
        onClearImage={() => setPendingImage(null)}
        onClearAudio={() => setPendingAudio(null)}
      />
      <form onSubmit={onSend} className="px-6 py-4 flex items-center gap-3">
        <button type="button" className="text-2xl">😊</button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 px-5 py-3 rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="hidden"
        />
        <button
          type="button"
          title="Attach image"
          onClick={() => fileInputRef.current?.click()}
          className="text-2xl hover:scale-110 transition"
        >
          📎
        </button>
        <button
          type="button"
          title="Capture screenshot"
          onClick={onOpenScreenCapture}
          className="text-2xl hover:scale-110 transition"
        >
          📷
        </button>
        <button
          type="button"
          title={recording ? 'Stop recording' : 'Record voice message'}
          onClick={onToggleRecord}
          className={`text-2xl hover:scale-110 transition ${
            recording ? 'text-red-500 animate-pulse' : ''
          }`}
        >
          {recording ? '⏹' : '🎙️'}
        </button>
      </form>
    </>
  )
}
