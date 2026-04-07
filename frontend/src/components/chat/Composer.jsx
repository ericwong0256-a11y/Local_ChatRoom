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
      <form onSubmit={onSend} className="chat-composer">
        <button type="button" className="composer-btn">😊</button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message..."
          className="chat-composer-input"
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
          className="composer-btn"
        >
          📎
        </button>
        <button
          type="button"
          title="Capture screenshot"
          onClick={onOpenScreenCapture}
          className="composer-btn"
        >
          📷
        </button>
        <button
          type="button"
          title={recording ? 'Stop recording' : 'Record voice message'}
          onClick={onToggleRecord}
          className={`composer-btn ${recording ? 'text-red-500 animate-pulse' : ''}`}
        >
          {recording ? '⏹' : '🎙️'}
        </button>
        <button
          type="submit"
          title="Send"
          disabled={!draft.trim() && !pendingImage && !pendingAudio}
          className="btn-primary btn-md disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </>
  )
}
