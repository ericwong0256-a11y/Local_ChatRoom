import './loadEnv.js'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

import authRoutes from './routes/auth.js'
import chatRoutes, { canAccessRoom } from './routes/chat.js'
import adminRoutes from './routes/admin.js'
import db from './db/index.js'
import { verifyToken } from './auth.js'

const PORT = process.env.PORT || 4000
const ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

const app = express()
app.use(cors({ origin: ORIGIN }))
app.use(express.json({ limit: '10mb' }))

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
  // Personal channel — receives every message for any room this user belongs to
  socket.join(`user:${socket.user.id}`)

  socket.on('room:join', (roomId) => {
    if (!canAccessRoom(roomId, socket.user.id)) return
    socket.join(`room:${roomId}`)
  })

  socket.on('message:send', ({ roomId, body, image, audio }) => {
    const text = (body || '').trim()
    if (!text && !image && !audio) return
    if (!canAccessRoom(roomId, socket.user.id)) return
    if (image && image.length > 2_800_000) return
    if (audio && audio.length > 7_000_000) return

    const now = Date.now()
    const info = db
      .prepare(
        'INSERT INTO messages (room_id, user_id, body, image, audio, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(roomId, socket.user.id, text, image || null, audio || null, now)

    // Keyword scan — flag the message if its body matches any registered keyword
    if (text) {
      const lower = text.toLowerCase()
      const keywords = db.prepare('SELECT id, word FROM keywords').all()
      const flag = db.prepare(
        'INSERT OR IGNORE INTO message_flags (message_id, keyword_id) VALUES (?, ?)',
      )
      for (const k of keywords) {
        if (k.word && lower.includes(k.word.toLowerCase())) {
          flag.run(info.lastInsertRowid, k.id)
        }
      }
    }

    const message = {
      id: info.lastInsertRowid,
      room_id: roomId,
      user_id: socket.user.id,
      author: socket.user.full_name,
      body: text,
      image: image || null,
      audio: audio || null,
      created_at: now,
    }

    // Emit to the active room (live message rendering)
    io.to(`room:${roomId}`).emit('message:new', message)

    // Also emit to every member's personal channel (so unread badges / toasts
    // work even when they're sitting on a different room).
    const room = db.prepare('SELECT is_private FROM rooms WHERE id = ?').get(roomId)
    let recipientIds
    if (room?.is_private) {
      recipientIds = db
        .prepare('SELECT user_id FROM room_members WHERE room_id = ?')
        .all(roomId)
        .map((r) => r.user_id)
    } else {
      recipientIds = db.prepare('SELECT id FROM users').all().map((r) => r.id)
    }
    for (const uid of recipientIds) {
      if (uid === socket.user.id) continue
      io.to(`user:${uid}`).emit('message:notify', message)
    }
  })

  socket.on('disconnect', () => {
    console.log(`socket disconnected: ${socket.user.email}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`MG_CHAT backend listening on http://localhost:${PORT}`)
})
