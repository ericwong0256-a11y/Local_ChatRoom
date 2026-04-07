import { Router } from 'express'
import db from '../db/index.js'
import { authMiddleware, adminMiddleware } from '../auth.js'

const router = Router()
router.use(authMiddleware, adminMiddleware)

// ---- Stats ----
router.get('/stats', (req, res) => {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todayTs = startOfToday.getTime()
  const weekAgo = now - 7 * dayMs

  const users = db.prepare('SELECT COUNT(*) AS c FROM users').get().c
  const admins = db.prepare('SELECT COUNT(*) AS c FROM users WHERE is_admin = 1').get().c
  const rooms = db.prepare('SELECT COUNT(*) AS c FROM rooms').get().c
  const publicRooms = db
    .prepare('SELECT COUNT(*) AS c FROM rooms WHERE is_private = 0').get().c
  const privateRooms = db
    .prepare('SELECT COUNT(*) AS c FROM rooms WHERE is_private = 1 AND is_dm = 0').get().c
  const dms = db.prepare('SELECT COUNT(*) AS c FROM rooms WHERE is_dm = 1').get().c
  const messages = db.prepare('SELECT COUNT(*) AS c FROM messages').get().c
  const messagesToday = db
    .prepare('SELECT COUNT(*) AS c FROM messages WHERE created_at >= ?').get(todayTs).c
  const newUsersThisWeek = db
    .prepare('SELECT COUNT(*) AS c FROM users WHERE created_at >= ?').get(weekAgo).c
  const activeUsersThisWeek = db
    .prepare('SELECT COUNT(DISTINCT user_id) AS c FROM messages WHERE created_at >= ?')
    .get(weekAgo).c

  // Messages per day for the last 7 days
  const activity = []
  for (let i = 6; i >= 0; i--) {
    const start = todayTs - i * dayMs
    const end = start + dayMs
    const count = db
      .prepare('SELECT COUNT(*) AS c FROM messages WHERE created_at >= ? AND created_at < ?')
      .get(start, end).c
    activity.push({
      date: new Date(start).toLocaleDateString(undefined, { weekday: 'short' }),
      count,
    })
  }

  const topRooms = db
    .prepare(
      `SELECT r.id, r.name, r.is_private, r.is_dm, COUNT(m.id) AS message_count
       FROM rooms r LEFT JOIN messages m ON m.room_id = r.id
       GROUP BY r.id ORDER BY message_count DESC LIMIT 5`,
    )
    .all()

  const recentUsers = db
    .prepare('SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5')
    .all()

  const recentMessages = db
    .prepare(
      `SELECT m.id, m.body, m.image, m.audio, m.created_at, u.full_name AS author, r.name AS room_name
       FROM messages m
       JOIN users u ON u.id = m.user_id
       JOIN rooms r ON r.id = m.room_id
       ORDER BY m.created_at DESC LIMIT 8`,
    )
    .all()

  res.json({
    users,
    admins,
    rooms,
    publicRooms,
    privateRooms,
    dms,
    messages,
    messagesToday,
    newUsersThisWeek,
    activeUsersThisWeek,
    activity,
    topRooms,
    recentUsers,
    recentMessages,
  })
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

// ---- Keywords ----
router.get('/keywords', (req, res) => {
  res.json(db.prepare('SELECT id, word, created_at FROM keywords ORDER BY word').all())
})

router.post('/keywords', (req, res) => {
  const { word } = req.body || {}
  const w = (word || '').trim()
  if (!w) return res.status(400).json({ error: 'Word required' })
  let id
  try {
    const info = db
      .prepare('INSERT INTO keywords (word, created_at) VALUES (?, ?)')
      .run(w, Date.now())
    id = info.lastInsertRowid
  } catch {
    return res.status(409).json({ error: 'Already exists' })
  }

  // Retroactively flag existing messages that contain this keyword
  const matches = db
    .prepare(`SELECT id FROM messages WHERE LOWER(body) LIKE ?`)
    .all(`%${w.toLowerCase()}%`)
  const flag = db.prepare(
    'INSERT OR IGNORE INTO message_flags (message_id, keyword_id) VALUES (?, ?)',
  )
  for (const m of matches) flag.run(m.id, id)

  res.json({ id, word: w, retroactive_matches: matches.length })
})

router.delete('/keywords/:id', (req, res) => {
  db.prepare('DELETE FROM keywords WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

// Flagged messages — joined with sender, room, recipient (for DMs)
router.get('/flagged-messages', (req, res) => {
  const rows = db
    .prepare(
      `SELECT m.id, m.body, m.created_at,
              u.id AS sender_id, u.full_name AS sender_name, u.email AS sender_email,
              r.id AS room_id, r.name AS room_name, r.is_dm,
              GROUP_CONCAT(k.word, '||') AS matched_words
       FROM messages m
       JOIN message_flags f ON f.message_id = m.id
       JOIN keywords k ON k.id = f.keyword_id
       JOIN users u ON u.id = m.user_id
       JOIN rooms r ON r.id = m.room_id
       GROUP BY m.id
       ORDER BY m.created_at DESC
       LIMIT 500`,
    )
    .all()

  // Resolve "recipient": if there's exactly one other member, use them.
  // Otherwise it's a multi-user channel → use the channel name.
  const otherMembers = db.prepare(
    `SELECT u.full_name, u.email FROM room_members rm
     JOIN users u ON u.id = rm.user_id
     WHERE rm.room_id = ? AND rm.user_id != ?`,
  )
  for (const r of rows) {
    r.matched_words = (r.matched_words || '').split('||').filter(Boolean)
    const others = otherMembers.all(r.room_id, r.sender_id)
    if (others.length === 1) {
      r.recipient_name = others[0].full_name
      r.recipient_email = others[0].email
      r.recipient_kind = 'user'
    } else {
      r.recipient_name = r.room_name
      r.recipient_email = ''
      r.recipient_kind = 'channel'
    }
  }
  res.json(rows)
})

router.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

export default router
