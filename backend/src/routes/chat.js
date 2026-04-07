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
  const me = db.prepare('SELECT full_name FROM users WHERE id = ?').get(req.user.id)
  const rooms = db
    .prepare(
      `SELECT DISTINCT r.id, r.name, r.is_private, r.is_dm, r.owner_id, r.created_at,
              CASE WHEN p.room_id IS NOT NULL THEN 1 ELSE 0 END AS is_pinned
       FROM rooms r
       LEFT JOIN room_members m ON m.room_id = r.id AND m.user_id = ?
       LEFT JOIN room_pins p ON p.room_id = r.id AND p.user_id = ?
       WHERE (r.is_private = 0 OR m.user_id = ?)
         AND NOT (r.is_private = 1 AND r.is_dm = 0 AND r.name = ?)
       ORDER BY r.id`,
    )
    .all(req.user.id, req.user.id, req.user.id, me?.full_name || '')

  // For DM rooms, override `name` with the *other* member's name
  for (const r of rooms) {
    if (r.is_dm) {
      const other = db
        .prepare(
          `SELECT u.full_name FROM room_members m
           JOIN users u ON u.id = m.user_id
           WHERE m.room_id = ? AND m.user_id != ?`,
        )
        .get(r.id, req.user.id)
      if (other) r.name = other.full_name
    }
  }
  res.json(rooms)
})

// Find or create a 1-on-1 DM room with another user
router.post('/dm/:userId', (req, res) => {
  const otherId = Number(req.params.userId)
  if (otherId === req.user.id) return res.status(400).json({ error: 'Cannot DM yourself' })
  const other = db.prepare('SELECT id, full_name FROM users WHERE id = ?').get(otherId)
  if (!other) return res.status(404).json({ error: 'User not found' })

  // Look for an existing DM room between exactly these two users
  const existing = db
    .prepare(
      `SELECT r.id, r.name, r.is_private, r.is_dm, r.owner_id, r.created_at
       FROM rooms r
       JOIN room_members a ON a.room_id = r.id AND a.user_id = ?
       JOIN room_members b ON b.room_id = r.id AND b.user_id = ?
       WHERE r.is_dm = 1
       LIMIT 1`,
    )
    .get(req.user.id, otherId)
  if (existing) {
    existing.name = other.full_name
    return res.json(existing)
  }

  const now = Date.now()
  const info = db
    .prepare(
      'INSERT INTO rooms (name, is_private, is_dm, owner_id, created_at) VALUES (?, 1, 1, ?, ?)',
    )
    .run(other.full_name, req.user.id, now)
  const roomId = info.lastInsertRowid
  const addMember = db.prepare(
    'INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)',
  )
  addMember.run(roomId, req.user.id)
  addMember.run(roomId, otherId)
  res.json({
    id: roomId,
    name: other.full_name,
    is_private: 1,
    is_dm: 1,
    owner_id: req.user.id,
    created_at: now,
  })
})

// Create a private channel and send invites to members
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

  // Owner joins immediately
  db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)').run(
    roomId,
    req.user.id,
  )
  // Others get an invite
  const invite = db.prepare(
    'INSERT OR IGNORE INTO room_invites (room_id, user_id, inviter_id, created_at) VALUES (?, ?, ?, ?)',
  )
  for (const uid of member_ids) {
    if (Number.isInteger(uid) && uid !== req.user.id) invite.run(roomId, uid, req.user.id, now)
  }

  res.json({
    id: roomId,
    name: name.trim(),
    is_private: 1,
    owner_id: req.user.id,
    created_at: now,
  })
})

// List my pending invites
router.get('/invites', (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.id AS room_id, r.name AS room_name, i.created_at,
              u.full_name AS inviter_name
       FROM room_invites i
       JOIN rooms r ON r.id = i.room_id
       LEFT JOIN users u ON u.id = i.inviter_id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC`,
    )
    .all(req.user.id)
  res.json(rows)
})

router.post('/invites/:roomId/accept', (req, res) => {
  const roomId = Number(req.params.roomId)
  const row = db
    .prepare('SELECT 1 FROM room_invites WHERE room_id = ? AND user_id = ?')
    .get(roomId, req.user.id)
  if (!row) return res.status(404).json({ error: 'No invite' })
  db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)').run(
    roomId,
    req.user.id,
  )
  db.prepare('DELETE FROM room_invites WHERE room_id = ? AND user_id = ?').run(
    roomId,
    req.user.id,
  )
  res.json({ ok: true, room_id: roomId })
})

router.post('/invites/:roomId/decline', (req, res) => {
  db.prepare('DELETE FROM room_invites WHERE room_id = ? AND user_id = ?').run(
    Number(req.params.roomId),
    req.user.id,
  )
  res.json({ ok: true })
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

// Pin / unpin a room for the current user
router.post('/rooms/:id/pin', (req, res) => {
  db.prepare(
    'INSERT OR IGNORE INTO room_pins (user_id, room_id, pinned_at) VALUES (?, ?, ?)',
  ).run(req.user.id, Number(req.params.id), Date.now())
  res.json({ ok: true })
})
router.delete('/rooms/:id/pin', (req, res) => {
  db.prepare('DELETE FROM room_pins WHERE user_id = ? AND room_id = ?').run(
    req.user.id,
    Number(req.params.id),
  )
  res.json({ ok: true })
})

// Leave a private channel (non-owner)
router.post('/rooms/:id/leave', (req, res) => {
  const roomId = Number(req.params.id)
  const room = db.prepare('SELECT owner_id, is_private FROM rooms WHERE id = ?').get(roomId)
  if (!room) return res.status(404).json({ error: 'Not found' })
  if (!room.is_private) return res.status(400).json({ error: 'Cannot leave public channel' })
  if (room.owner_id === req.user.id) {
    return res.status(400).json({ error: 'Owner must delete the channel instead' })
  }
  db.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?').run(
    roomId,
    req.user.id,
  )
  res.json({ ok: true })
})

// Owner invites more users to an existing private channel
router.post('/rooms/:id/invite', (req, res) => {
  const roomId = Number(req.params.id)
  const { member_ids = [] } = req.body || {}
  const room = db.prepare('SELECT owner_id, is_private FROM rooms WHERE id = ?').get(roomId)
  if (!room) return res.status(404).json({ error: 'Not found' })
  if (!room.is_private) return res.status(400).json({ error: 'Public channel' })
  if (room.owner_id !== req.user.id) return res.status(403).json({ error: 'Owner only' })

  const now = Date.now()
  const isMember = db.prepare(
    'SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?',
  )
  const invite = db.prepare(
    'INSERT OR IGNORE INTO room_invites (room_id, user_id, inviter_id, created_at) VALUES (?, ?, ?, ?)',
  )
  let added = 0
  for (const uid of member_ids) {
    if (!Number.isInteger(uid) || uid === req.user.id) continue
    if (isMember.get(roomId, uid)) continue
    invite.run(roomId, uid, req.user.id, now)
    added++
  }
  res.json({ ok: true, invited: added })
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
