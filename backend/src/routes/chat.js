import { Router } from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/me', (req, res) => {
  const u = db
    .prepare(
      'SELECT id, full_name, email, avatar, is_admin, created_at FROM users WHERE id = ?',
    )
    .get(req.user.id)
  if (!u) return res.status(404).json({ error: 'Not found' })
  res.json(u)
})

router.patch('/me', (req, res) => {
  const { full_name, email } = req.body || {}
  if (!full_name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Name and email required' })
  }
  const dup = db
    .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
    .get(email.trim(), req.user.id)
  if (dup) return res.status(409).json({ error: 'Email already in use' })
  db.prepare('UPDATE users SET full_name = ?, email = ? WHERE id = ?').run(
    full_name.trim(),
    email.trim(),
    req.user.id,
  )
  const u = db
    .prepare('SELECT id, full_name, email, is_admin, created_at FROM users WHERE id = ?')
    .get(req.user.id)
  res.json(u)
})

router.get('/contacts', (req, res) => {
  const rows = db
    .prepare(
      'SELECT id, full_name, email, is_admin, created_at FROM users WHERE id != ? ORDER BY full_name',
    )
    .all(req.user.id)
  res.json(rows)
})

// List rooms the user can see: public rooms + private rooms where they're a member
router.get('/rooms', (req, res) => {
  const rooms = db
    .prepare(
      `SELECT DISTINCT r.id, r.name, r.is_private, r.owner_id, r.created_at
       FROM rooms r
       LEFT JOIN room_members m ON m.room_id = r.id AND m.user_id = ?
       WHERE r.is_private = 0 OR m.user_id = ?
       ORDER BY r.id`,
    )
    .all(req.user.id, req.user.id)
  res.json(rooms)
})

// Create a private channel and invite members
router.post('/rooms', (req, res) => {
  const { name, member_ids = [] } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' })

  const now = Date.now()
  const info = db
    .prepare(
      'INSERT INTO rooms (name, is_private, owner_id, created_at) VALUES (?, 1, ?, ?)',
    )
    .run(name.trim(), req.user.id, now)
  const roomId = info.lastInsertRowid

  const addMember = db.prepare(
    'INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)',
  )
  addMember.run(roomId, req.user.id)
  for (const uid of member_ids) {
    if (Number.isInteger(uid) && uid !== req.user.id) addMember.run(roomId, uid)
  }

  res.json({ id: roomId, name: name.trim(), is_private: 1, owner_id: req.user.id, created_at: now })
})

// Members of a room
router.get('/rooms/:id/members', (req, res) => {
  const roomId = Number(req.params.id)
  if (!canAccessRoom(roomId, req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const rows = db
    .prepare(
      `SELECT u.id, u.full_name, u.email
       FROM room_members m JOIN users u ON u.id = m.user_id
       WHERE m.room_id = ?
       ORDER BY u.full_name`,
    )
    .all(roomId)
  res.json(rows)
})

// Delete a private channel (owner only)
router.delete('/rooms/:id', (req, res) => {
  const roomId = Number(req.params.id)
  const room = db.prepare('SELECT owner_id, is_private FROM rooms WHERE id = ?').get(roomId)
  if (!room) return res.status(404).json({ error: 'Not found' })
  if (!room.is_private) return res.status(400).json({ error: 'Cannot delete public channel' })
  if (room.owner_id !== req.user.id) return res.status(403).json({ error: 'Owner only' })
  db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId)
  res.json({ ok: true })
})

router.get('/rooms/:id/messages', (req, res) => {
  const roomId = Number(req.params.id)
  if (!canAccessRoom(roomId, req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const messages = db
    .prepare(
      `SELECT m.id, m.room_id, m.body, m.image, m.audio, m.created_at, m.user_id, u.full_name AS author
       FROM messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.room_id = ?
       ORDER BY m.created_at ASC
       LIMIT 200`,
    )
    .all(roomId)
  res.json(messages)
})

export function canAccessRoom(roomId, userId) {
  const room = db.prepare('SELECT is_private FROM rooms WHERE id = ?').get(roomId)
  if (!room) return false
  if (!room.is_private) return true
  const member = db
    .prepare('SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?')
    .get(roomId, userId)
  return !!member
}

export default router
