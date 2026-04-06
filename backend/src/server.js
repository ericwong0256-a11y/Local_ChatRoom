import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'
import adminRoutes from './routes/admin.js'
import db from './db/index.js'
import { verifyToken } from './auth.js'

const PORT = process.env.PORT || 4000
const ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

const app = express()
app.use(cors({ origin: ORIGIN }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', chatRoutes)

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: ORIGIN } })

// Socket auth via JWT in handshake
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  const payload = token && verifyToken(token)
  if (!payload) return next(new Error('Unauthorized'))
  socket.user = payload
  next()
})

io.on('connection', (socket) => {
  console.log(`socket connected: ${socket.user.email}`)

  socket.on('room:join', (roomId) => {
    socket.join(`room:${roomId}`)
  })

  socket.on('message:send', ({ roomId, body }) => {
    if (!body?.trim()) return
    const now = Date.now()
    const info = db
      .prepare(
        'INSERT INTO messages (room_id, user_id, body, created_at) VALUES (?, ?, ?, ?)',
      )
      .run(roomId, socket.user.id, body.trim(), now)

    const message = {
      id: info.lastInsertRowid,
      room_id: roomId,
      user_id: socket.user.id,
      author: socket.user.full_name,
      body: body.trim(),
      created_at: now,
    }
    io.to(`room:${roomId}`).emit('message:new', message)
  })

  socket.on('disconnect', () => {
    console.log(`socket disconnected: ${socket.user.email}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`MG_CHAT backend listening on http://localhost:${PORT}`)
})
