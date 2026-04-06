import db from './index.js'
console.log('Database initialized.')
console.log('Rooms:', db.prepare('SELECT * FROM rooms').all())
