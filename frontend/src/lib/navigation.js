import { useNavigate } from 'react-router-dom'
import { auth } from './auth.js'
import { disconnectSocket } from './socket.js'

const PATHS = {
  signin: '/signin',
  signup: '/signup',
  forgot: '/forgot',
  chat: '/chat',
  settings: '/settings',
  admin: '/admin',
}

/**
 * Backwards-compatible `go(screenName)` that screens already use.
 * Translates screen names to URLs via react-router-dom.
 */
export function useGo() {
  const navigate = useNavigate()
  return (screen) => {
    if (screen === 'signin' || screen === 'signup') {
      auth.clear()
      disconnectSocket()
    }
    const path = PATHS[screen] || `/${screen}`
    navigate(path)
  }
}
