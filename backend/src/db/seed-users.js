import bcrypt from 'bcryptjs'
import db from './index.js'

const fakeUsers = [
  { full_name: 'John Doe',     email: 'john@mgchat.local',    password: 'password123' },
  { full_name: 'Sarah Smith',  email: 'sarah@mgchat.local',   password: 'password123' },
  { full_name: 'Michael Lee',  email: 'michael@mgchat.local', password: 'password123' },
  { full_name: 'Alex Johnson', email: 'alex@mgchat.local',    password: 'password123' },
  { full_name: 'Emma Brown',   email: 'emma@mgchat.local',    password: 'password123' },
]

const insert = db.prepare(
  'INSERT INTO users (full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
)

let added = 0
for (const u of fakeUsers) {
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email)
  if (exists) {
    console.log(`- skip ${u.email} (already exists)`)
    continue
  }
  insert.run(u.full_name, u.email, bcrypt.hashSync(u.password, 10), Date.now())
  console.log(`+ added ${u.email}`)
  added++
}
console.log(`\nDone. ${added} users added. Password for all: password123`)
