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

function showBrowserNotification(msg, roomName) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  const body = msg.image ? '📷 Image' : msg.audio ? '🎙️ Voice message' : msg.body
  try {
    const n = new Notification(`${msg.author} • ${roomName || 'New message'}`, {
      body,
      tag: `room-${msg.room_id}`,
      silent: true,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {}
}

/**
 * Tracks unread counts per room and pings the user (sound + browser notification)
 * whenever a message arrives for a room they're not currently viewing.
 */
export function useNotifications({ activeRoom, meId, rooms }) {
  const [unread, setUnread] = useState({}) // { [roomId]: count }
  const activeRef = useRef(activeRoom)
  const meRef = useRef(meId)
  const roomsRef = useRef(rooms)

  useEffect(() => { activeRef.current = activeRoom }, [activeRoom])
  useEffect(() => { meRef.current = meId }, [meId])
  useEffect(() => { roomsRef.current = rooms }, [rooms])

  // Ask for browser permission once
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  // Listen to *every* incoming message globally (independent of useMessages)
  useEffect(() => {
    const socket = getSocket()
    const onNew = (msg) => {
      if (msg.user_id === meRef.current) return // ignore own messages
      const isActive = msg.room_id === activeRef.current && document.hasFocus()
      if (isActive) return

      setUnread((u) => ({ ...u, [msg.room_id]: (u[msg.room_id] || 0) + 1 }))
      playBeep()
      const room = roomsRef.current.find((r) => r.id === msg.room_id)
      showBrowserNotification(msg, room?.name)
    }
    socket.on('message:new', onNew)
    return () => socket.off('message:new', onNew)
  }, [])

  // Clear unread for the room you just opened
  useEffect(() => {
    if (!activeRoom) return
    setUnread((u) => {
      if (!u[activeRoom]) return u
      const next = { ...u }
      delete next[activeRoom]
      return next
    })
  }, [activeRoom])

  return { unread }
}
