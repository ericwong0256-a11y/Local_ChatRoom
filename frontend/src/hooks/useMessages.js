import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { getSocket } from '../lib/socket.js'

export function useMessages(activeRoom) {
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const scrollRef = useRef(null)

  // Load messages + join room + listen for new messages
  useEffect(() => {
    if (!activeRoom) {
      setMessages([])
      setMembers([])
      return
    }
    const socket = getSocket()
    api.messages(activeRoom).then(setMessages).catch(() => setMessages([]))
    api.members(activeRoom).then(setMembers).catch(() => setMembers([]))
    socket.emit('room:join', activeRoom)

    const onNew = (msg) => {
      if (msg.room_id === activeRoom) {
        setMessages((m) => [...m, msg])
      }
    }
    socket.on('message:new', onNew)
    return () => socket.off('message:new', onNew)
  }, [activeRoom])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const sendMessage = ({ roomId, body, image, audio }) => {
    if ((!body?.trim() && !image && !audio) || !roomId) return
    getSocket().emit('message:send', { roomId, body: body?.trim() || '', image, audio })
  }

  return { messages, setMessages, members, scrollRef, sendMessage }
}
