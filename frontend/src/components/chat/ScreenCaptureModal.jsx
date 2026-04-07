import { useEffect, useRef, useState } from 'react'

export default function ScreenCaptureModal({ onClose, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError('Screen capture is not supported in this browser.')
      return
    }
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: false })
      .then((s) => {
        streamRef.current = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play()
          setReady(true)
        }
        s.getVideoTracks()[0]?.addEventListener('ended', onClose)
      })
      .catch((err) => {
        if (err?.name === 'NotAllowedError') onClose()
        else setError(err.message || 'Screen capture unavailable')
      })
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const snap = () => {
    const video = videoRef.current
    if (!video || !ready) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    onCapture(canvas.toDataURL('image/png'))
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Capture Screenshot</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[200px]">
          {error ? (
            <p className="text-red-300 text-sm py-12 px-4 text-center">{error}</p>
          ) : (
            <video ref={videoRef} className="max-w-full max-h-[60vh] rounded-lg" muted />
          )}
        </div>
        <div className="px-5 py-3 flex justify-between items-center bg-slate-50">
          <p className="text-xs text-slate-500">
            {ready
              ? 'Frame your shot, then click Capture.'
              : 'Choose a screen or window to share.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={snap}
              disabled={!ready || !!error}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-60"
            >
              📸 Capture
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
