import { Router } from 'express'
import db from '../db/index.js'
import { authMiddleware, adminMiddleware } from '../auth.js'

const router = Router()
router.use(authMiddleware, adminMiddleware)

// ---- Stats ----
router.get('/stats', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) AS c FROM users').get().c
  const admins = db.prepare('SELECT COUNT(*) AS c FROM users WHERE is_admin = 1').get().c
  const rooms = db.prepare('SELECT COUNT(*) AS c FROM rooms').get().c
  const messages = db.prepare('SELECT COUNT(*) AS c FROM messages').get().c
  const recentUsers = db
    .prepare('SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5')
    .all()
  res.json({ users, admins, rooms, messages, recentUsers })
})

// ---- Users ----
router.get('/users', (req, res) => {
  const rows = db
    .prepare(
      'SELECT id, full_name, email, is_admin, created_at FROM users ORDER BY created_at DESC',
    )
    .all()
  res.json(rows)
})

router.patch('/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const { is_admin } = req.body || {}
  if (typeof is_admin !== 'boolean') return res.status(400).json({ error: 'is_admin required' })
  if (id === req.user.id && !is_admin) {
    return res.status(400).json({ error: 'Cannot demote yourself' })
  }
  db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(is_admin ? 1 : 0, id)
  res.json({ ok: true })
})

router.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id)
  if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' })
  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  res.json({ ok: true })
})

// ---- Rooms ----
router.get('/rooms', (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.id, r.name, r.created_at,
              (SELECT COUNT(*) FROM messages m WHERE m.room_id = r.id) AS message_count
       FROM rooms r ORDER BY r.id`,
    )
    .all()
  res.json(rows)
})

router.post('/rooms', (req, res) => {
  const { name } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' })
  const info = db
    .prepare('INSERT INTO rooms (name, created_at) VALUES (?, ?)')
    .run(name.trim(), Date.now())
  res.json({ id: info.lastInsertRowid, name: name.trim() })
})

router.patch('/rooms/:id', (req, res) => {
  const { name } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' })
  db.prepare('UPDATE rooms SET name = ? WHERE id = ?').run(name.trim(), Number(req.params.id))
  res.json({ ok: true })
})

router.delete('/rooms/:id', (req, res) => {
  db.prepare('DELETE FROM rooms WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

// ---- Messages ----
router.get('/rooms/:id/messages', (req, res) => {
  const rows = db
    .prepare(
      `SELECT m.id, m.body, m.created_at, m.user_id, u.full_name AS author, u.email
       FROM messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.room_id = ?
       ORDER BY m.created_at DESC
       LIMIT 500`,
    )
    .all(Number(req.params.id))
  res.json(rows)
})

router.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

export default router
