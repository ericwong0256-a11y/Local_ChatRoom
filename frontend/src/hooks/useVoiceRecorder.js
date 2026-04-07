import { useRef, useState } from 'react'

const MAX_SECONDS = 120
const MAX_BYTES = 5 * 1024 * 1024

export function useVoiceRecorder({ onComplete } = {}) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const recorderRef = useRef(null)
  const timerRef = useRef(null)

  const stop = () => recorderRef.current?.stop()

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg')
          ? 'audio/ogg'
          : ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      const chunks = []
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        clearInterval(timerRef.current)
        setRecording(false)
        setSeconds(0)
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' })
        if (blob.size === 0) return
        if (blob.size > MAX_BYTES) {
          alert('Recording too long (max ~5 MB).')
          return
        }
        const reader = new FileReader()
        reader.onload = () => onComplete?.(reader.result)
        reader.readAsDataURL(blob)
      }
      recorderRef.current = rec
      rec.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            rec.state === 'recording' && rec.stop()
            return s
          }
          return s + 1
        })
      }, 1000)
    } catch (err) {
      alert('Microphone unavailable: ' + (err.message || err))
    }
  }

  const toggle = () => (recording ? stop() : start())

  return { recording, seconds, toggle }
}
