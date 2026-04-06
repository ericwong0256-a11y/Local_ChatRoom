# MG_CHAT

A clean, modern local chat room UI built with **React**, **Vite**, and **Tailwind CSS**. MG_CHAT is a single-page application showcasing a polished messaging interface — including authentication, conversations, and account settings — using mock data only (no backend required).

---

## Features

- **Sign In / Sign Up** — Branded authentication screens with form validation-ready inputs.
- **Chat Workspace** — Sidebar with conversation list, search, unread indicators, and a live message composer.
- **Settings** — Tabbed account panel with profile editing, language, auto-download toggles, and danger-zone actions.
- **Responsive & Themed** — Tailwind-powered design system with a consistent brand palette and Inter typography.
- **Zero Backend** — Fully client-side; ideal for prototyping, demos, or as a starter for a real-time chat backend.

---

## Tech Stack

| Layer       | Tooling                    |
| ----------- | -------------------------- |
| Framework   | React 18                   |
| Build Tool  | Vite 5                     |
| Styling     | Tailwind CSS 3             |
| Language    | JavaScript (JSX)           |
| Fonts       | Inter (Google Fonts)       |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **18+**
- npm (bundled with Node)

### Installation

```bash
git clone https://github.com/<your-username>/Local_ChatRoom.git
cd Local_ChatRoom
npm install
```

### Development

```bash
npm run dev
```

Then open the URL printed in your terminal (typically `http://localhost:5173`).

### Production Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```text
Local_ChatRoom/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── main.jsx            # App entry
    ├── App.jsx             # Screen router (state-based)
    ├── index.css           # Tailwind + global styles
    ├── components/
    │   └── Logo.jsx
    └── screens/
        ├── SignIn.jsx
        ├── SignUp.jsx
        ├── Chat.jsx
        └── Settings.jsx
```

---

## Screens

1. **Sign In** — Email + password with "Forgot password?" affordance.
2. **Sign Up** — Full name, email, password, confirm password.
3. **Chat** — Conversation list, active thread, message bubbles, composer.
4. **Settings** — Account, Notifications, Privacy & Security, Data and Storage.

---

## Roadmap

- [ ] React Router for real URL-based navigation
- [ ] localStorage persistence for messages and profile
- [ ] Dark mode toggle
- [ ] WebSocket backend for true multi-client chat
- [ ] Emoji picker and file attachments

---

## License

MIT © MG_CHAT contributors
