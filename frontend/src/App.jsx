import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './screens/SignIn.jsx'
import SignUp from './screens/SignUp.jsx'
import Forgot from './screens/Forgot.jsx'
import Chat from './screens/Chat.jsx'
import Settings from './screens/Settings.jsx'
import Admin from './screens/Admin.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import { ConfirmProvider } from './components/ui/ConfirmProvider.jsx'
import { useGo } from './lib/navigation.js'
import { auth } from './lib/auth.js'

// Wrapper that injects the `go` prop screens already expect
function withGo(Component) {
  return function WrappedScreen() {
    const go = useGo()
    return <Component go={go} />
  }
}

const SignInPage = withGo(SignIn)
const SignUpPage = withGo(SignUp)
const ForgotPage = withGo(Forgot)
const ChatPage = withGo(Chat)
const SettingsPage = withGo(Settings)
const AdminPage = withGo(Admin)

export default function App() {
  return (
    <BrowserRouter>
      <ConfirmProvider>
      <div className="h-full w-full">
        <Routes>
          <Route path="/" element={<Navigate to={auth.token() ? '/chat' : '/signin'} replace />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot" element={<ForgotPage />} />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <ChatPage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      </ConfirmProvider>
    </BrowserRouter>
  )
}
