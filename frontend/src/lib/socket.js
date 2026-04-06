import { io } from 'socket.io-client'
import { BASE_URL } from './api.js'
import { auth } from './auth.js'

let socket = null

export function getSocket() {
  if (socket && socket.connected) return socket
  socket = io(BASE_URL, {
    auth: { token: auth.token() },
    autoConnect: true,
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
