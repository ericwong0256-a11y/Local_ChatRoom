import jwt from 'jsonwebtoken'
import 'dotenv/config'

const SECRET = process.env.JWT_SECRET || 'dev-secret'

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name },
    SECRET,
    { expiresIn: '7d' },
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const payload = token && verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })
  req.user = payload
  next()
}
