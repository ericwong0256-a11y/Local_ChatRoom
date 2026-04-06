import { useState, useEffect } from 'react'
import SignIn from './screens/SignIn.jsx'
import SignUp from './screens/SignUp.jsx'
import Chat from './screens/Chat.jsx'
import Settings from './screens/Settings.jsx'
import { auth } from './lib/auth.js'
import { disconnectSocket } from './lib/socket.js'

export default function App() {
  const [screen, setScreen] = useState(() => (auth.token() ? 'chat' : 'signin'))

  const go = (s) => {
    if (s === 'signin' || s === 'signup') {
      auth.clear()
      disconnectSocket()
    }
    setScreen(s)
  }

  return (
    <div className="h-full w-full">
      {screen === 'signin' && <SignIn go={go} />}
      {screen === 'signup' && <SignUp go={go} />}
      {screen === 'chat' && <Chat go={go} />}
      {screen === 'settings' && <Settings go={go} />}
    </div>
  )
}
