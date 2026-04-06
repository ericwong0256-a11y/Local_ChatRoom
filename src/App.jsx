import { useState } from 'react'
import SignIn from './screens/SignIn.jsx'
import SignUp from './screens/SignUp.jsx'
import Chat from './screens/Chat.jsx'
import Settings from './screens/Settings.jsx'

export default function App() {
  const [screen, setScreen] = useState('signin')

  const go = (s) => setScreen(s)

  return (
    <div className="h-full w-full">
      {screen === 'signin' && <SignIn go={go} />}
      {screen === 'signup' && <SignUp go={go} />}
      {screen === 'chat' && <Chat go={go} />}
      {screen === 'settings' && <Settings go={go} />}
    </div>
  )
}
