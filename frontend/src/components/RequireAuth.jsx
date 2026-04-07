import { Navigate } from 'react-router-dom'
import { auth } from '../lib/auth.js'

export default function RequireAuth({ children }) {
  return auth.token() ? children : <Navigate to="/signin" replace />
}
