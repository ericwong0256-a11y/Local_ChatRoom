import { Router } from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/rooms', (req, res) => {
  const rooms = db.prepare('SELECT id, name, created_at FROM rooms ORDER BY id').all()
  res.json(rooms)
})

router.get('/rooms/:id/messages', (req, res) => {
  const roomId = Number(req.params.id)
  const messages = db
    .prepare(
      `SELECT m.id, m.body, m.created_at, m.user_id, u.full_name AS author
       FROM messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.room_id = ?
       ORDER BY m.created_at ASC
       LIMIT 200`,
    )
    .all(roomId)
  res.json(messages)
})

export default router
