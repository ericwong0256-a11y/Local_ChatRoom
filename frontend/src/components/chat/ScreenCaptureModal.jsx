import { useEffect, useRef, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'

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
    <Modal
      title="Capture Screenshot"
      size="xl"
      onClose={onClose}
      footer={
        <>
          <span className="text-xs text-slate-500 mr-auto self-center">
            {ready ? 'Frame your shot, then click Capture.' : 'Choose a screen or window to share.'}
          </span>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={snap} disabled={!ready || !!error}>📸 Capture</Button>
        </>
      }
    >
      <div className="bg-slate-900 -mx-6 -my-5 p-4 flex items-center justify-center min-h-[200px]">
        {error ? (
          <p className="text-red-300 text-sm py-12 px-4 text-center">{error}</p>
        ) : (
          <video ref={videoRef} className="max-w-full max-h-[60vh] rounded-lg" muted />
        )}
      </div>
    </Modal>
  )
}
