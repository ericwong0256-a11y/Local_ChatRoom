import { useEffect, useRef, useState } from 'react'
import { getSocket } from '../lib/socket.js'

// Tiny WebAudio "ding" so we don't need an asset file
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
    osc.onended = () => ctx.close()
  } catch {}
}

/**
 * Tracks unread counts per room and emits in-app toasts (with sound)
 * for messages received in non-active rooms.
 */
export function useNotifications({ activeRoom, meId, rooms }) {
  const [unread, setUnread] = useState({})
  const [toasts, setToasts] = useState([])
  const activeRef = useRef(activeRoom)
  const meRef = useRef(meId)
  const roomsRef = useRef(rooms)

  useEffect(() => { activeRef.current = activeRoom }, [activeRoom])
  useEffect(() => { meRef.current = meId }, [meId])
  useEffect(() => { roomsRef.current = rooms }, [rooms])

  useEffect(() => {
    const socket = getSocket()
    const onNew = (msg) => {
      if (msg.user_id === meRef.current) return
      const isActive = msg.room_id === activeRef.current && document.hasFocus()
      if (isActive) return

      setUnread((u) => ({ ...u, [msg.room_id]: (u[msg.room_id] || 0) + 1 }))
      playBeep()

      const room = roomsRef.current.find((r) => r.id === msg.room_id)
      setToasts((list) => [
        ...list,
        {
          id: `${msg.id}-${Date.now()}`,
          room_id: msg.room_id,
          roomName: room?.name || 'New message',
          author: msg.author,
          body: msg.body,
          image: msg.image,
          audio: msg.audio,
        },
      ])
    }
    socket.on('message:new', onNew)
    return () => socket.off('message:new', onNew)
  }, [])

  useEffect(() => {
    if (!activeRoom) return
    setUnread((u) => {
      if (!u[activeRoom]) return u
      const next = { ...u }
      delete next[activeRoom]
      return next
    })
  }, [activeRoom])

  const dismissToast = (id) => setToasts((list) => list.filter((t) => t.id !== id))

  return { unread, toasts, dismissToast }
}
