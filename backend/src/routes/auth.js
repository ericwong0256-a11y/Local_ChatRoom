import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import db from '../db/index.js'
import { signToken } from '../auth.js'

const router = Router()
const RESET_TTL_MS = 15 * 60 * 1000 // 15 minutes

function publicUser(u) {
  return { id: u.id, full_name: u.full_name, email: u.email, is_admin: !!u.is_admin }
}

router.post('/signup', (req, res) => {
  const { full_name, email, password } = req.body || {}
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const hash = bcrypt.hashSync(password, 10)
  const info = db
    .prepare(
      'INSERT INTO users (full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
    )
    .run(full_name, email, hash, Date.now())

  const user = publicUser({ id: info.lastInsertRowid, full_name, email, is_admin: 0 })
  res.json({ user, token: signToken(user) })
})

router.post('/signin', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const safe = publicUser(user)
  res.json({ user: safe, token: signToken(safe) })
})

// Request a password reset token
router.post('/forgot', (req, res) => {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email required' })

  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email)
  // Always respond OK to avoid leaking which emails exist
  if (!user) return res.json({ ok: true })

  const token = randomBytes(24).toString('hex')
  const expires = Date.now() + RESET_TTL_MS
  db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id)
  db.prepare(
    'INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)',
  ).run(token, user.id, expires)

  console.log('\n=== PASSWORD RESET ===')
  console.log(`User : ${user.email}`)
  console.log(`Token: ${token}`)
  console.log(`Expires in 15 minutes`)
  console.log('======================\n')

  // In dev, return the token so the UI can show it. Remove in production.
  res.json({ ok: true, token })
})

// Submit reset token + new password
router.post('/reset', (req, res) => {
  const { token, password } = req.body || {}
  if (!token || !password) return res.status(400).json({ error: 'Missing fields' })
  if (password.length < 6) return res.status(400).json({ error: 'Password too short' })

  const row = db
    .prepare('SELECT user_id, expires_at FROM password_resets WHERE token = ?')
    .get(token)
  if (!row) return res.status(400).json({ error: 'Invalid token' })
  if (row.expires_at < Date.now()) {
    db.prepare('DELETE FROM password_resets WHERE token = ?').run(token)
    return res.status(400).json({ error: 'Token expired' })
  }

  const hash = bcrypt.hashSync(password, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id)
  db.prepare('DELETE FROM password_resets WHERE token = ?').run(token)
  res.json({ ok: true })
})

export default router
