import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db/index.js'
import { signToken } from '../auth.js'

const router = Router()

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

  const user = { id: info.lastInsertRowid, full_name, email }
  res.json({ user, token: signToken(user) })
})

router.post('/signin', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const safe = { id: user.id, full_name: user.full_name, email: user.email }
  res.json({ user: safe, token: signToken(safe) })
})

export default router
