import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import 'dotenv/config'

const dbPath = process.env.DB_PATH || './data/mgchat.db'
mkdirSync(dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_private INTEGER NOT NULL DEFAULT 0,
    is_dm INTEGER NOT NULL DEFAULT 0,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS room_members (
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS room_invites (
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inviter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (room_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS room_pins (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    pinned_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, room_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL DEFAULT '',
    image TEXT,
    audio TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at);

  CREATE TABLE IF NOT EXISTS password_resets (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
`)

// Add is_admin column if upgrading from older schema
const userCols = db.prepare(`PRAGMA table_info(users)`).all()
if (!userCols.some((c) => c.name === 'is_admin')) {
  db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0`)
}

// Add is_private / owner_id to rooms if upgrading
const roomCols = db.prepare(`PRAGMA table_info(rooms)`).all()
if (!roomCols.some((c) => c.name === 'is_private')) {
  db.exec(`ALTER TABLE rooms ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0`)
}
if (!roomCols.some((c) => c.name === 'owner_id')) {
  db.exec(`ALTER TABLE rooms ADD COLUMN owner_id INTEGER`)
}
if (!roomCols.some((c) => c.name === 'is_dm')) {
  db.exec(`ALTER TABLE rooms ADD COLUMN is_dm INTEGER NOT NULL DEFAULT 0`)
}

// Add image / audio columns to messages if upgrading
const msgCols = db.prepare(`PRAGMA table_info(messages)`).all()
if (!msgCols.some((c) => c.name === 'image')) {
  db.exec(`ALTER TABLE messages ADD COLUMN image TEXT`)
}
if (!msgCols.some((c) => c.name === 'audio')) {
  db.exec(`ALTER TABLE messages ADD COLUMN audio TEXT`)
}

// Seed default room
if (db.prepare('SELECT COUNT(*) AS c FROM rooms').get().c === 0) {
  db.prepare('INSERT INTO rooms (name, created_at) VALUES (?, ?)').run(
    'Development Team',
    Date.now(),
  )
}

// Seed admin user from env
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD
const adminName = process.env.ADMIN_NAME || 'Administrator'
if (adminEmail && adminPassword) {
  const hash = bcrypt.hashSync(adminPassword, 10)
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
  if (!existing) {
    db.prepare(
      'INSERT INTO users (full_name, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, 1, ?)',
    ).run(adminName, adminEmail, hash, Date.now())
    console.log(`Seeded admin user: ${adminEmail}`)
  } else {
    db.prepare(
      'UPDATE users SET password_hash = ?, is_admin = 1, full_name = ? WHERE id = ?',
    ).run(hash, adminName, existing.id)
    console.log(`Refreshed admin user: ${adminEmail}`)
  }
}

export default db
