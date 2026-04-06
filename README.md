# MG_CHAT

A clean, modern local chat room application with a real-time backend and a polished React UI. MG_CHAT is split into two independent services — a **Node.js + Express + Socket.IO** API backed by **SQLite**, and a **React + Vite + Tailwind CSS** frontend — so you can run, develop, and deploy each side on its own.

---

## Features

- **Authentication** — Sign up and sign in with bcrypt-hashed passwords and JWT-based sessions.
- **Real-Time Messaging** — Socket.IO delivers messages instantly to every connected client in a room.
- **Persistent History** — All users, rooms, and messages are stored in a local SQLite database.
- **Polished UI** — Branded sign in / sign up, conversation sidebar, live message thread, and account settings.
- **Zero External Services** — Runs entirely on your machine; no cloud dependencies required.

---

## Tech Stack

| Layer        | Tooling                                   |
| ------------ | ----------------------------------------- |
| Frontend     | React 18, Vite 5, Tailwind CSS 3          |
| Realtime     | socket.io-client                          |
| Backend      | Node.js, Express 4, Socket.IO 4           |
| Database     | SQLite (via `better-sqlite3`)             |
| Auth         | bcryptjs, jsonwebtoken                    |
| Language     | JavaScript (ESM)                          |

---

## Project Structure

```text
Local_ChatRoom/
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js          # Express + Socket.IO entry
│       ├── auth.js            # JWT helpers + middleware
│       ├── db/
│       │   ├── index.js       # SQLite setup, schema, seed
│       │   └── init.js        # Manual init/inspection script
│       └── routes/
│           ├── auth.js        # POST /api/auth/signup | /signin
│           └── chat.js        # GET  /api/rooms | /api/rooms/:id/messages
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx            # Screen router (state-based)
        ├── index.css          # Tailwind + global styles
        ├── components/
        │   └── Logo.jsx
        ├── lib/
        │   ├── api.js         # REST client
        │   ├── auth.js        # Token + user persistence
        │   └── socket.js      # Socket.IO singleton
        └── screens/
            ├── SignIn.jsx
            ├── SignUp.jsx
            ├── Chat.jsx
            └── Settings.jsx
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **18+** and npm
- A C/C++ build toolchain for compiling `better-sqlite3` (Windows: install **Visual Studio Build Tools** with the "Desktop development with C++" workload)

### 1. Backend

```bash
cd backend
cp .env.example .env        # then edit JWT_SECRET to a long random string
npm install
npm run dev                 # starts on http://localhost:4000
```

Environment variables (`backend/.env`):

| Variable        | Default                       | Description                          |
| --------------- | ----------------------------- | ------------------------------------ |
| `PORT`          | `4000`                        | API + Socket.IO port                 |
| `JWT_SECRET`    | _required_                    | Secret used to sign JWTs             |
| `CLIENT_ORIGIN` | `http://localhost:5173`       | Allowed CORS / Socket.IO origin      |
| `DB_PATH`       | `./data/mgchat.db`            | SQLite database file location        |

### 2. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # starts on http://localhost:5173
```

Open `http://localhost:5173` in two browser windows, create two accounts, and chat in real time.

---

## API Overview

### REST

| Method | Endpoint                       | Auth | Description                      |
| ------ | ------------------------------ | ---- | -------------------------------- |
| GET    | `/api/health`                  | —    | Liveness probe                   |
| POST   | `/api/auth/signup`             | —    | Create account, returns JWT      |
| POST   | `/api/auth/signin`             | —    | Sign in, returns JWT             |
| GET    | `/api/rooms`                   | JWT  | List all rooms                   |
| GET    | `/api/rooms/:id/messages`      | JWT  | Last 200 messages in a room      |

### Socket.IO

The client connects to the same origin and authenticates via `auth: { token }` in the handshake.

| Event          | Direction       | Payload                                              |
| -------------- | --------------- | ---------------------------------------------------- |
| `room:join`    | client → server | `roomId: number`                                     |
| `message:send` | client → server | `{ roomId, body }`                                   |
| `message:new`  | server → client | `{ id, room_id, user_id, author, body, created_at }` |

---

## Database Schema

SQLite tables created automatically on first run:

- **users** — `id`, `full_name`, `email` (unique), `password_hash`, `avatar`, `created_at`
- **rooms** — `id`, `name`, `created_at` (seeded with a default `Development Team` room)
- **messages** — `id`, `room_id`, `user_id`, `body`, `created_at`

---

## Production Build

```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
npm start
```

For deployment, serve `frontend/dist/` from any static host and run the backend as a long-lived Node process (PM2, systemd, Docker, etc.).

---

## Roadmap

- [ ] Create / join rooms from the UI
- [ ] Direct messages between users
- [ ] Typing indicators and read receipts
- [ ] File and image attachments
- [ ] Dark mode toggle
- [ ] Dockerfile and docker-compose for one-command startup

---

## License

MIT © MG_CHAT contributors
